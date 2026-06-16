import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Image } from "expo-image";
import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore";
import COLORS from "../../constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { API_URL } from "../../constants/api";
import styles from "../../assets/styles/home.styles";
import { formatPublishedDate } from "../../lib/utils";
import Loader from "../../components/Loader";

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default function Home() {
  const { token, logout } = useAuthStore();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);

  const fecthBooks = async (pageNum = 1, refresh = false, signal) => {
    try {
      setError(null);
      if (refresh) setRefreshing(true);
      else if (pageNum === 1) setLoading(true);
      const response = await fetch(`${API_URL}/books?page=${pageNum}&limit=5`, {
        signal,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.status === 401 || response.status === 403) {
        setError("Session expired. Please sign in again.");
        logout();
        return;
      }
      if (!response.ok)
        throw new Error(data.message || "Failed to fetch the books");

      const mergedBooks =
        refresh || pageNum === 1
          ? data.books
          : Array.from(
              new Map(
                [...books, ...data.books].map((book) => [book._id, book])
              ).values()
            );
      setBooks(mergedBooks);

      setHasMore(pageNum < data.totalPages);
      setPage(pageNum);
    } catch (error) {
      if (error.name !== "AbortError") {
        console.log("Error fetching books", error);
        setError(error.message || "Unable to fetch book recommendations.");
      }
    } finally {
      if (refresh) {
        await sleep(500);
        setRefreshing(false);
      } else setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fecthBooks(1, false, controller.signal);
    return () => controller.abort();
  }, []);

  const handleLoadMore = async () => {
    if (hasMore && !loading && !refreshing) {
      // await sleep(1000);
      await fecthBooks(page + 1);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.bookCard}>
      <View style={styles.bookHeader}>
        <View style={styles.userInfo}>
          <Image
            source={{ uri: item.user.profileImage }}
            style={styles.avatar}
          />
          <Text style={styles.username}>{item.user.username}</Text>
        </View>
      </View>
      <View style={styles.bookImageContainer}>
        <Image
          source={item.image}
          style={styles.bookImage}
          contentFit="cover"
        />
      </View>
      <View style={styles.bookDetails}>
        <Text style={styles.bookTitle}>{item.title}</Text>
        <View style={styles.ratingContainer}>
          {renderRatingStars(item.rating)}
        </View>
        <Text style={styles.caption}>{item.caption}</Text>
        <Text style={styles.date}>
          Shared on {formatPublishedDate(item.createdAt)}
        </Text>
      </View>
    </View>
  );

  const renderRatingStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? "star" : "star-outline"}
          size={16}
          color={i <= rating ? "#f4b400" : COLORS.textSecondary}
          style={{ marginRight: 2 }}
        />
      );
    }
    return stars;
  };

  // console.log(books.length);
  if (loading) return <Loader />;
  if (error)
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="alert-circle-outline" size={60} color={COLORS.primary} />
        <Text style={styles.emptyText}>{error}</Text>
      </View>
    );

  return (
    <View style={styles.container}>
      <FlatList
        data={books}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fecthBooks(1, true)}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>BookWorm🌾</Text>
            <Text style={styles.headerSubtitle}>
              Discover great reads from the community⚡
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="book-outline"
              size={60}
              color={COLORS.textSecondary}
            />
            <Text style={styles.emptyText}>No recommendation yet</Text>
            <Text style={styles.emptySubtext}>
              Be the first to share a book!
            </Text>
          </View>
        }
        ListFooterComponent={
          hasMore && books.length > 0 ? (
            <ActivityIndicator
              style={styles.footerLoader}
              size="small"
              color={COLORS.primary}
            />
          ) : null
        }
      />
    </View>
  );
}

// testing purposes
// <View>
// <Text>Home tab</Text>
//       <TouchableOpacity onPress={logout}>
//         <Text>Logout</Text>
//       </TouchableOpacity>
//       </View>

// usage of expo image lib is without  uri
