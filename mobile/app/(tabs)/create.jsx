// import { useRouter } from "expo-router";
// import { useState } from "react";
// import {
//   View,
//   Text,
//   KeyboardAvoidingView,
//   Platform,
//   ScrollView,
//   TextInput,
//   TouchableOpacity,
//   Image,
//   Alert,
//   ActivityIndicator,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import COLORS from "../../constants/colors";
// import * as ImagePicker from "expo-image-picker";
// import * as FileSystem from "expo-file-system";
// import styles from "../../assets/styles/create.styles";
// import { useAuthStore } from "../../store/authStore";
// import { API_URL } from "../../constants/api";

// export default function Create() {
//   const [title, setTitle] = useState("");
//   const [caption, setCaption] = useState("");
//   const [rating, setRating] = useState(3);
//   const [image, setImage] = useState(null); // to display the selected image
//   const [imageBase64, setImageBase64] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const { token } = useAuthStore();
//   const router = useRouter();
//   const pickImage = async () => {
//     try {
//       // request fro permission if needed
//       if (Platform.OS !== "web") {
//         const { status } =
//           await ImagePicker.requestMediaLibraryPermissionsAsync();

//         if (status !== "granted") {
//           Alert.alert(
//             "Permission Denied",
//             "We need camera roll permission to upload an image"
//           );
//           return;
//         }
//       }
//       // launch the image library
//       const result = await ImagePicker.launchImageLibraryAsync({
//         // mediaTypes:["images","videos"]
//         mediaTypes: "images",
//         allowsEditing: true,
//         aspect: [4, 3],
//         quality: 0.5, //lower the quality for smaller base64
//         base64: true,
//       });
//       if (!result.canceled) {
//         const selected = result.assets[0];
//         const bytes = selected.fileSize ?? selected.base64?.length * 0.75;
//         const maxSize = 10 * 1024 * 1024;

//         if (bytes && bytes > maxSize) {
//           Alert.alert(
//             "Image too large",
//             "Please select an image smaller than 10MB."
//           );
//           return;
//         }

//         console.log("Result is :", result);
//         setImage(selected.uri);
//         // if base64 is provided lets use it
//         if (selected.base64) {
//           setImageBase64(selected.base64);
//         } else {
//           // convert to base 64
//           const base64 = await FileSystem.readAsStringAsync(selected.uri, {
//             encoding: FileSystem.EncodingType.Base64,
//           });
//           if (base64.length * 0.75 > maxSize) {
//             Alert.alert(
//               "Image too large",
//               "Please select an image smaller than 10MB."
//             );
//             return;
//           }
//           setImageBase64(base64);
//         }
//       }
//     } catch (error) {
//       console.log("Error in picking Image:", error);
//       Alert.alert("Error", "There was a problem selecting your image");
//     }
//   };
//   const handleSubmit = async () => {
// if (!title || !caption || !image || !rating) {
//       Alert.alert("Error", "Please fill in all the fields!");
//       return;
//     }

//     try {
//       // const token = await AsyncStorage.getItem("token")

//       setLoading(true);
//       const uriparts = image.split(".");
//       const fileType = uriparts[uriparts.length - 1]?.toLowerCase();
//       const imageType = fileType ? `image/${fileType}` : "image/jpeg";
//       const filename = `photo.${fileType || "jpg"}`;

//       const formData = new FormData();
//       formData.append("title", title);
//       formData.append("caption", caption);
//       formData.append("rating", rating.toString());
//       formData.append("image", {
//         uri: image,
//         name: filename,
//         type: imageType,
//       });

//       const response = await fetch(`${API_URL}/books`, {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//         body: formData,
//       });

//       if (!response.ok) {
//         const contentType = response.headers.get("content-type");
//         let errorMessage = "Something went wrong";

//         try {
//           if (contentType && contentType.includes("application/json")) {
//             const data = await response.json();
//             errorMessage = data.message || errorMessage;
//           } else {
//             errorMessage = `Server error (${response.status}): ${response.statusText}`;
//           }
//         } catch (parseError) {
//           errorMessage = `Server error (${response.status})`;
//         }

//         throw new Error(errorMessage);
//       }

//       const data = await response.json();
//       console.log(data);

//       Alert.alert("Success", "Your book recommendation have been posted!");
//       setTitle("");
//       setCaption("");
//       setRating(3);
//       setImage(null);
//       setImageBase64(null);
//       router.push("/");
//     } catch (error) {
//       console.log("Error creating the post:", error);
//       let errorMsg = error.message || "Something went wrong";
//       if (error.name === "AbortError") {
//         errorMsg = "Request timeout. Please check your internet connection and try again.";
//       }
//       Alert.alert("Error", errorMsg);
//     } finally {
//       setLoading(false);
//     }
//   };
//   const renderRatingPicker = () => {
//     const stars = [];
//     for (let i = 1; i <= 5; i++) {
//       stars.push(
//         <TouchableOpacity
//           key={i}
//           onPress={() => setRating(i)}
//           style={styles.starButton}
//         >
//           <Ionicons
//             name={i <= rating ? "star" : "star-outline"}
//             size={32}
//             color={i <= rating ? "#f4b400" : COLORS.textSecondary}
//           />
//         </TouchableOpacity>
//       );
//     }
//     return <View style={styles.ratingContainer}>{stars}</View>;
//   };

//   return (
//     <KeyboardAvoidingView
//       style={{ flex: 1 }}
//       behavior={Platform.OS === "ios" ? "padding" : "height"}
//     >
//       <ScrollView
//         contentContainerStyle={styles.container}
//         style={styles.scrollViewStyle}
//       >
//         <View style={styles.card}>
//           {/* header  */}
//           <View style={styles.header}>
//             <Text style={styles.title}>Add Book Recommendation</Text>
//             <Text style={styles.subtitle}>
//               Share your favourite reads with others
//             </Text>
//           </View>
//           <View style={styles.form}>
//             {/* book title */}
//             <View style={styles.formGroup}>
//               <Text style={styles.label}>Book Title</Text>
//               <View style={styles.inputContainer}>
//                 <Ionicons
//                   name="book-outline"
//                   size={20}
//                   color={COLORS.textSecondary}
//                   style={styles.inputIcon}
//                 />
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Enter book title"
//                   placeholderTextColor={COLORS.placeholderText}
//                   value={title}
//                   onChangeText={setTitle}
//                 />
//               </View>
//             </View>
//             {/* rating  */}
//             <View style={styles.formGroup}>
//               <Text style={styles.label}>Your Rating</Text>
//               {renderRatingPicker()}
//             </View>

//             {/* image  */}
//             <View style={styles.formGroup}>
//               <Text style={styles.label}>Book Image</Text>
//               <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
//                 {image ? (
//                   <Image source={{ uri: image }} style={styles.previewImage} />
//                 ) : (
//                   <View style={styles.placeholderContainer}>
//                     <Ionicons
//                       name="image-outline"
//                       size={40}
//                       color={COLORS.textSecondary}
//                     />
//                     <Text style={styles.placeholderText}>
//                       Tap to select image
//                     </Text>
//                   </View>
//                 )}
//               </TouchableOpacity>
//             </View>

//             {/* caption */}
//             <View style={styles.formGroup}>
//               <Text style={styles.label}>Caption</Text>

//               <TextInput
//                 style={styles.textArea}
//                 placeholder="Write your review or thoughts about this book...."
//                 placeholderTextColor={COLORS.placeholderText}
//                 value={caption}
//                 onChangeText={setCaption}
//                 multiline
//               />
//             </View>

//             {/* submit button  */}
//             <TouchableOpacity
//               style={styles.button}
//               onPress={handleSubmit}
//               disabled={loading}
//             >
//               {loading ? (
//                 <ActivityIndicator color={COLORS.white} />
//               ) : (
//                 <>
//                   <Ionicons
//                     name="cloud-upload-outline"
//                     size={20}
//                     color={COLORS.white}
//                     style={styles.buttonIcon}
//                   />
//                   <Text style={styles.buttonText}>Share</Text>
//                 </>
//               )}
//             </TouchableOpacity>
//           </View>
//         </View>
//       </ScrollView>
//     </KeyboardAvoidingView>
//   );
// }

// import { useRouter } from "expo-router";
// import { useState } from "react";
// import {
//   View,
//   Text,
//   KeyboardAvoidingView,
//   Platform,
//   ScrollView,
//   TextInput,
//   TouchableOpacity,
//   Image,
//   Alert,
//   ActivityIndicator,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import COLORS from "../../constants/colors";
// import * as ImagePicker from "expo-image-picker";
// import * as FileSystem from "expo-file-system";
// import styles from "../../assets/styles/create.styles";
// import { useAuthStore } from "../../store/authStore";
// import { API_URL } from "../../constants/api";

// export default function Create() {
//   const [title, setTitle] = useState("");
//   const [caption, setCaption] = useState("");
//   const [rating, setRating] = useState(3);
//   const [image, setImage] = useState(null);
//   const [imageBase64, setImageBase64] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const { token } = useAuthStore();
//   const router = useRouter();

//   const pickImage = async () => {
//     try {
//       if (Platform.OS !== "web") {
//         const { status } =
//           await ImagePicker.requestMediaLibraryPermissionsAsync();

//         if (status !== "granted") {
//           Alert.alert(
//             "Permission Denied",
//             "We need camera roll permission to upload an image",
//           );
//           return;
//         }
//       }

//       const result = await ImagePicker.launchImageLibraryAsync({
//         mediaTypes: "images",
//         allowsEditing: true,
//         aspect: [4, 3],
//         quality: 0.5,
//         base64: true,
//       });

//       if (!result.canceled) {
//         const selected = result.assets[0];
//         const bytes = selected.fileSize ?? selected.base64?.length * 0.75;
//         const maxSize = 10 * 1024 * 1024;

//         if (bytes && bytes > maxSize) {
//           Alert.alert(
//             "Image too large",
//             "Please select an image smaller than 10MB.",
//           );
//           return;
//         }

//         console.log("Result is :", result);
//         setImage(selected.uri);

//         if (selected.base64) {
//           setImageBase64(selected.base64);
//         } else {
//           const base64 = await FileSystem.readAsStringAsync(selected.uri, {
//             encoding: FileSystem.EncodingType.Base64,
//           });
//           if (base64.length * 0.75 > maxSize) {
//             Alert.alert(
//               "Image too large",
//               "Please select an image smaller than 10MB.",
//             );
//             return;
//           }
//           setImageBase64(base64);
//         }
//       }
//     } catch (error) {
//       console.log("Error in picking Image:", error);
//       Alert.alert("Error", "There was a problem selecting your image");
//     }
//   };

//   // const handleSubmit = async () => {
//   //   if (!title || !caption || !image || !rating) {
//   //     Alert.alert("Error", "Please fill in all the fields!");
//   //     return;
//   //   }

//   //   try {
//   //     setLoading(true);
//   //     const uriparts = image.split(".");
//   //     const fileType = uriparts[uriparts.length - 1]?.toLowerCase();
//   //     const imageType = fileType ? `image/${fileType}` : "image/jpeg";
//   //     const filename = `photo.${fileType || "jpg"}`;

//   //     const formData = new FormData();
//   //     formData.append("title", title);
//   //     formData.append("caption", caption);
//   //     formData.append("rating", rating.toString());
//   //     formData.append("image", {
//   //       uri: image,
//   //       name: filename,
//   //       type: imageType,
//   //     });

//   //     const response = await fetch(`${API_URL}/books`, {
//   //       method: "POST",
//   //       headers: {
//   //         Authorization: `Bearer ${token}`,
//   //       },
//   //       body: formData,
//   //     });

//   //     if (!response.ok) {
//   //       const contentType = response.headers.get("content-type");
//   //       let errorMessage = "Something went wrong";

//   //       try {
//   //         if (contentType && contentType.includes("application/json")) {
//   //           const data = await response.json();
//   //           errorMessage = data.message || errorMessage;
//   //         } else {
//   //           errorMessage = `Server error (${response.status}): ${response.statusText}`;
//   //         }
//   //       } catch (parseError) {
//   //         errorMessage = `Server error (${response.status})`;
//   //       }

//   //       throw new Error(errorMessage);
//   //     }

//   //     const data = await response.json();
//   //     console.log(data);

//   //     Alert.alert("Success", "Your book recommendation has been posted!");
//   //     setTitle("");
//   //     setCaption("");
//   //     setRating(3);
//   //     setImage(null);
//   //     setImageBase64(null);
//   //     router.push("/");
//   //   } catch (error) {
//   //     console.log("Error creating the post:", error);
//   //     let errorMsg = error.message || "Something went wrong";
//   //     if (error.name === "AbortError") {
//   //       errorMsg =
//   //         "Request timeout. Please check your internet connection and try again.";
//   //     }
//   //     Alert.alert("Error", errorMsg);
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };

//   // const handleSubmit = async () => {
//   //   if (!title || !caption || !image || !rating) {
//   //     Alert.alert("Error", "Please fill in all the fields!");
//   //     return;
//   //   }

//   //   try {
//   //     setLoading(true);

//   //     // 1. Sanitize the image URI for React Native FormData compatibility
//   //     // iOS paths are usually fine, but Android paths sometimes need 'file://' adjustments
//   //     const cleanUri =
//   //       Platform.OS === "android" ? image : image.replace("file://", "");

//   //     const uriparts = image.split(".");
//   //     const fileType = uriparts[uriparts.length - 1]?.toLowerCase();
//   //     const imageType = fileType ? `image/${fileType}` : "image/jpeg";
//   //     const filename = `photo.${fileType || "jpg"}`;

//   //     const formData = new FormData();
//   //     formData.append("title", title);
//   //     formData.append("caption", caption);
//   //     formData.append("rating", rating.toString());

//   //     // 2. Cast the image structure correctly as an 'any' style object for React Native
//   //     formData.append("image", {
//   //       uri: cleanUri,
//   //       name: filename,
//   //       type: imageType,
//   //     });

//   //     // 3. CRITICAL: Do NOT add 'Content-Type': 'multipart/form-data' manually.
//   //     // Fetch must generate its own boundary tokens automatically.
//   //     const response = await fetch(`${API_URL}/books`, {
//   //       method: "POST",
//   //       headers: {
//   //         Authorization: `Bearer ${token}`,
//   //         // 'Accept': 'application/json', // Optional: tells server what frontend expects back
//   //       },
//   //       body: formData,
//   //     });

//   //     if (!response.ok) {
//   //       const contentType = response.headers.get("content-type");
//   //       let errorMessage = "Something went wrong";

//   //       try {
//   //         if (contentType && contentType.includes("application/json")) {
//   //           const data = await response.json();
//   //           errorMessage = data.message || errorMessage;
//   //         } else {
//   //           errorMessage = `Server error (${response.status}): ${response.statusText}`;
//   //         }
//   //       } catch (parseError) {
//   //         errorMessage = `Server error (${response.status})`;
//   //       }

//   //       throw new Error(errorMessage);
//   //     }

//   //     const data = await response.json();
//   //     console.log("Success backend response:", data);

//   //     Alert.alert("Success", "Your book recommendation has been posted!");
//   //     setTitle("");
//   //     setCaption("");
//   //     setRating(3);
//   //     setImage(null);
//   //     setImageBase64(null);
//   //     router.push("/");
//   //   } catch (error) {
//   //     console.log("Error creating the post:", error);
//   //     let errorMsg = error.message || "Something went wrong";
//   //     if (error.name === "AbortError") {
//   //       errorMsg =
//   //         "Request timeout. Please check your internet connection and try again.";
//   //     }
//   //     Alert.alert("Error", errorMsg);
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };

//   // new
//   // const handleSubmit = async () => {
//   //   if (!title || !caption || !image || !rating) {
//   //     Alert.alert("Error", "Please fill in all the fields!");
//   //     return;
//   //   }

//   //   // Fallback safety catch in case imageBase64 didn't populate
//   //   if (!imageBase64) {
//   //     Alert.alert(
//   //       "Error",
//   //       "Image data is still processing. Please try selecting the image again.",
//   //     );
//   //     return;
//   //   }

//   //   try {
//   //     setLoading(true);

//   //     const uriparts = image.split(".");
//   //     const fileType = uriparts[uriparts.length - 1]?.toLowerCase() || "jpeg";
//   //     const imageType = fileType === "jpg" ? "jpeg" : fileType;

//   //     // 1. Package everything as standard JSON
//   //     const payload = {
//   //       title,
//   //       caption,
//   //       rating: rating.toString(),
//   //       // Format as Data URI schema for easy parsing
//   //       imageFile: `data:image/${imageType};base64,${imageBase64}`,
//   //     };

//   //     // 2. Fetch using explicit application/json headers
//   //     const response = await fetch(`${API_URL}/books`, {
//   //       method: "POST",
//   //       headers: {
//   //         "Content-Type": "application/json",
//   //         Accept: "application/json",
//   //         Authorization: `Bearer ${token}`,
//   //       },
//   //       body: JSON.stringify(payload),
//   //     });

//   //     if (!response.ok) {
//   //       const contentType = response.headers.get("content-type");
//   //       let errorMessage = "Something went wrong";

//   //       try {
//   //         if (contentType && contentType.includes("application/json")) {
//   //           const data = await response.json();
//   //           errorMessage = data.message || errorMessage;
//   //         } else {
//   //           errorMessage = `Server error (${response.status}): ${response.statusText}`;
//   //         }
//   //       } catch (parseError) {
//   //         errorMessage = `Server error (${response.status})`;
//   //       }

//   //       throw new Error(errorMessage);
//   //     }

//   //     const data = await response.json();
//   //     console.log(data);

//   //     Alert.alert("Success", "Your book recommendation has been posted!");
//   //     setTitle("");
//   //     setCaption("");
//   //     setRating(3);
//   //     setImage(null);
//   //     setImageBase64(null);
//   //     router.push("/");
//   //   } catch (error) {
//   //     console.log("Error creating the post:", error);
//   //     let errorMsg = error.message || "Something went wrong";
//   //     if (error.name === "AbortError") {
//   //       errorMsg =
//   //         "Request timeout. Please check your internet connection and try again.";
//   //     }
//   //     Alert.alert("Error", errorMsg);
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };

//   // const handleSubmit = async () => {
//   //   // checking
//   //   const payload = {
//   //     title: title.trim(),
//   //     caption: caption.trim(),
//   //     rating: rating.toString(),
//   //     imageFile: `data:image/${imageType};base64,${base64Data}`,
//   //   };

//   //   console.log("FRONTEND PAYLOAD BEING SENT TO SERVER:", {
//   //     title: payload.title,
//   //     caption: payload.caption,
//   //     rating: payload.rating,
//   //     imageLength: payload.imageFile.length, // Prints string size instead of polluting the log
//   //   });

//   //   if (!title || !caption || !image || !rating) {
//   //     Alert.alert("Error", "Please fill in all the fields!");
//   //     return;
//   //   }

//   //   try {
//   //     setLoading(true);

//   //     // 1. Double check that we have a valid Base64 string.
//   //     // If state is empty, read it directly from the file URI.
//   //     let base64Data = imageBase64;
//   //     if (!base64Data) {
//   //       console.log(
//   //         "Base64 state was empty, reading directly from file system...",
//   //       );
//   //       base64Data = await FileSystem.readAsStringAsync(image, {
//   //         encoding: FileSystem.EncodingType.Base64,
//   //       });
//   //     }

//   //     const uriparts = image.split(".");
//   //     const fileType = uriparts[uriparts.length - 1]?.toLowerCase() || "jpeg";
//   //     const imageType = fileType === "jpg" ? "jpeg" : fileType;

//   //     // 2. Build the exact payload object
//   //     const payload = {
//   //       title: title.trim(),
//   //       caption: caption.trim(),
//   //       rating: rating.toString(),
//   //       imageFile: `data:image/${imageType};base64,${base64Data}`, // This provides the full base64 file data
//   //     };

//   //     // 3. Send to the backend
//   //     const response = await fetch(`${API_URL}/books`, {
//   //       method: "POST",
//   //       headers: {
//   //         "Content-Type": "application/json",
//   //         Accept: "application/json",
//   //         Authorization: `Bearer ${token}`,
//   //       },
//   //       body: JSON.stringify(payload),
//   //     });

//   //     if (!response.ok) {
//   //       const contentType = response.headers.get("content-type");
//   //       let errorMessage = "Something went wrong";

//   //       try {
//   //         if (contentType && contentType.includes("application/json")) {
//   //           const data = await response.json();
//   //           errorMessage = data.message || errorMessage;
//   //         } else {
//   //           errorMessage = `Server error (${response.status}): ${response.statusText}`;
//   //         }
//   //       } catch (parseError) {
//   //         errorMessage = `Server error (${response.status})`;
//   //       }

//   //       throw new Error(errorMessage);
//   //     }

//   //     const data = await response.json();
//   //     console.log("Success:", data);

//   //     Alert.alert("Success", "Your book recommendation has been posted!");
//   //     setTitle("");
//   //     setCaption("");
//   //     setRating(3);
//   //     setImage(null);
//   //     setImageBase64(null);
//   //     router.push("/");
//   //   } catch (error) {
//   //     console.log("Error creating the post:", error);
//   //     let errorMsg = error.message || "Something went wrong";
//   //     if (error.name === "AbortError") {
//   //       errorMsg =
//   //         "Request timeout. Please check your internet connection and try again.";
//   //     }
//   //     Alert.alert("Error", errorMsg);
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };
//   // testing
//   const handleSubmit = async () => {
//     if (!title || !caption || !image || !rating) {
//       Alert.alert("Error", "Please fill in all the fields!");
//       return;
//     }

//     try {
//       setLoading(true);

//       // 1. Get the base64 string safely
//       let base64Data = imageBase64;
//       if (!base64Data) {
//         console.log(
//           "Base64 state was empty, reading directly from file system...",
//         );
//         base64Data = await FileSystem.readAsStringAsync(image, {
//           encoding: FileSystem.EncodingType.Base64,
//         });
//       }

//       // 2. Safely parse and calculate the image file extension type
//       const uriparts = image.split(".");
//       const fileExtension =
//         uriparts[uriparts.length - 1]?.toLowerCase() || "jpeg";
//       const cleanImageType = fileExtension === "jpg" ? "jpeg" : fileExtension;

//       // 3. Assemble payload with guaranteed scope-bound variables
//       const payload = {
//         title: title.trim(),
//         caption: caption.trim(),
//         rating: rating.toString(),
//         imageFile: `data:image/${cleanImageType};base64,${base64Data}`,
//       };

//       console.log(
//         "Sending payload to backend with image data length:",
//         base64Data.length,
//       );

//       // 4. Fire the JSON payload across the network
//       const response = await fetch(`${API_URL}/books`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Accept: "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(payload),
//       });

//       if (!response.ok) {
//         const contentType = response.headers.get("content-type");
//         let errorMessage = "Something went wrong";

//         try {
//           if (contentType && contentType.includes("application/json")) {
//             const data = await response.json();
//             errorMessage = data.message || errorMessage;
//           } else {
//             errorMessage = `Server error (${response.status}): ${response.statusText}`;
//           }
//         } catch (parseError) {
//           errorMessage = `Server error (${response.status})`;
//         }

//         throw new Error(errorMessage);
//       }

//       const data = await response.json();
//       console.log("Book successfully created:", data);

//       Alert.alert("Success", "Your book recommendation has been posted!");
//       setTitle("");
//       setCaption("");
//       setRating(3);
//       setImage(null);
//       setImageBase64(null);
//       router.push("/");
//     } catch (error) {
//       console.log("Error creating the post:", error);
//       let errorMsg = error.message || "Something went wrong";
//       if (error.name === "AbortError") {
//         errorMsg =
//           "Request timeout. Please check your internet connection and try again.";
//       }
//       Alert.alert("Error", errorMsg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const renderRatingPicker = () => {
//     const stars = [];
//     for (let i = 1; i <= 5; i++) {
//       stars.push(
//         <TouchableOpacity
//           key={i}
//           onPress={() => setRating(i)}
//           style={styles.starButton}
//         >
//           <Ionicons
//             name={i <= rating ? "star" : "star-outline"}
//             size={32}
//             color={i <= rating ? "#f4b400" : COLORS.textSecondary}
//           />
//         </TouchableOpacity>,
//       );
//     }
//     return <View style={styles.ratingContainer}>{stars}</View>;
//   };

//   return (
//     <KeyboardAvoidingView
//       style={{ flex: 1 }}
//       behavior={Platform.OS === "ios" ? "padding" : "height"}
//     >
//       <ScrollView
//         contentContainerStyle={styles.container}
//         style={styles.scrollViewStyle}
//       >
//         <View style={styles.card}>
//           <View style={styles.header}>
//             <Text style={styles.title}>Add Book Recommendation</Text>
//             <Text style={styles.subtitle}>
//               Share your favourite reads with others
//             </Text>
//           </View>

//           <View style={styles.form}>
//             <View style={styles.formGroup}>
//               <Text style={styles.label}>Book Title</Text>
//               <View style={styles.inputContainer}>
//                 <Ionicons
//                   name="book-outline"
//                   size={20}
//                   color={COLORS.textSecondary}
//                   style={styles.inputIcon}
//                 />
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Enter book title"
//                   placeholderTextColor={COLORS.placeholderText}
//                   value={title}
//                   onChangeText={setTitle}
//                 />
//               </View>
//             </View>

//             <View style={styles.formGroup}>
//               <Text style={styles.label}>Your Rating</Text>
//               {renderRatingPicker()}
//             </View>

//             <View style={styles.formGroup}>
//               <Text style={styles.label}>Book Image</Text>
//               <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
//                 {image ? (
//                   <Image source={{ uri: image }} style={styles.previewImage} />
//                 ) : (
//                   <View style={styles.placeholderContainer}>
//                     <Ionicons
//                       name="image-outline"
//                       size={40}
//                       color={COLORS.textSecondary}
//                     />
//                     <Text style={styles.placeholderText}>
//                       Tap to select image
//                     </Text>
//                   </View>
//                 )}
//               </TouchableOpacity>
//             </View>

//             <View style={styles.formGroup}>
//               <Text style={styles.label}>Caption / Description</Text>
//               <TextInput
//                 style={[
//                   styles.input,
//                   { height: 100, textAlignVertical: "top" },
//                 ]}
//                 placeholder="Why do you recommend this book?"
//                 placeholderTextColor={COLORS.placeholderText}
//                 value={caption}
//                 onChangeText={setCaption}
//                 multiline={true}
//               />
//             </View>

//             <TouchableOpacity
//               style={[styles.submitButton, loading && styles.disabledButton]}
//               onPress={handleSubmit}
//               disabled={loading}
//             >
//               {loading ? (
//                 <ActivityIndicator color="#fff" />
//               ) : (
//                 <Text style={styles.submitButtonText}>Post Recommendation</Text>
//               )}
//             </TouchableOpacity>
//           </View>
//         </View>
//       </ScrollView>
//     </KeyboardAvoidingView>
//   );
// }

import { useRouter } from "expo-router";
import { useState } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../constants/colors";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import styles from "../../assets/styles/create.styles";
import { useAuthStore } from "../../store/authStore";
import { API_URL } from "../../constants/api";

export default function Create() {
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [rating, setRating] = useState(3);
  const [image, setImage] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [loading, setLoading] = useState(false);
  const { token } = useAuthStore();
  const router = useRouter();

  // const pickImage = async () => {
  //   try {
  //     if (Platform.OS !== "web") {
  //       const { status } =
  //         await ImagePicker.requestMediaLibraryPermissionsAsync();

  //       if (status !== "granted") {
  //         Alert.alert(
  //           "Permission Denied",
  //           "We need camera roll permission to upload an image",
  //         );
  //         return;
  //       }
  //     }

  //     const result = await ImagePicker.launchImageLibraryAsync({
  //       mediaTypes: "images",
  //       allowsEditing: true,
  //       aspect: [4, 3],
  //       // quality: 0.5,
  //       quality: 0.2,
  //       base64: true,
  //     });

  //     // if (!result.canceled) {
  //     //   const selected = result.assets[0];
  //     //   const bytes = selected.fileSize ?? selected.base64?.length * 0.75;
  //     //   const maxSize = 10 * 1024 * 1024;

  //     //   if (bytes && bytes > maxSize) {
  //     //     Alert.alert(
  //     //       "Image too large",
  //     //       "Please select an image smaller than 10MB.",
  //     //     );
  //     //     return;
  //     //   }

  //     //   console.log("Result is :", result);
  //     //   setImage(selected.uri);

  //     //   if (selected.base64) {
  //     //     setImageBase64(selected.base64);
  //     //   } else {
  //     //     const base64 = await FileSystem.readAsStringAsync(selected.uri, {
  //     //       encoding: FileSystem.EncodingType.Base64,
  //     //     });
  //     //     if (base64.length * 0.75 > maxSize) {
  //     //       Alert.alert(
  //     //         "Image too large",
  //     //         "Please select an image smaller than 10MB.",
  //     //       );
  //     //       return;
  //     //     }
  //     //     setImageBase64(base64);
  //     //   }
  //     // }
  //     // if (!result.canceled) {
  //     //   // 1. FIXED: You must target the first item [0] inside the assets array!
  //     //   const selected = result.assets[0];

  //     //   const bytes = selected.fileSize ?? selected.base64?.length * 0.75;
  //     //   const maxSize = 10 * 1024 * 1024;

  //     //   if (bytes && bytes > maxSize) {
  //     //     Alert.alert(
  //     //       "Image too large",
  //     //       "Please select an image smaller than 10MB.",
  //     //     );
  //     //     return;
  //     //   }

  //     //   console.log("Result is :", result);
  //     //   setImage(selected.uri); // Now this will successfully get the real string path!

  //     //   if (selected.base64) {
  //     //     setImageBase64(selected.base64);
  //     //   } else {
  //     //     const base64 = await FileSystem.readAsStringAsync(selected.uri, {
  //     //       encoding: FileSystem.EncodingType.Base64,
  //     //     });
  //     //     if (base64.length * 0.75 > maxSize) {
  //     //       Alert.alert(
  //     //         "Image too large",
  //     //         "Please select an image smaller than 10MB.",
  //     //       );
  //     //       return;
  //     //     }
  //     //     setImageBase64(base64);
  //     //   }
  //     // }

  //     if (!result.canceled) {
  //       const selected = result.assets[0];

  //       console.log("Image successfully compressed!");
  //       setImage(selected.uri);

  //       if (selected.base64) {
  //         setImageBase64(selected.base64);
  //       } else {
  //         const base64 = await FileSystem.readAsStringAsync(selected.uri, {
  //           encoding: FileSystem.EncodingType.Base64,
  //         });
  //         setImageBase64(base64);
  //       }
  //     }
  //   } catch (error) {
  //     console.log("Error in picking Image:", error);
  //     Alert.alert("Error", "There was a problem selecting your image");
  //   }
  // };

  // const handleSubmit = async () => {
  //   if (!title || !caption || !image || !rating) {
  //     Alert.alert("Error", "Please fill in all the fields!");
  //     return;
  //   }

  //   try {
  //     setLoading(true);

  //     let base64Data = imageBase64;
  //     if (!base64Data) {
  //       console.log("Base64 state was empty, reading from URI...");
  //       base64Data = await FileSystem.readAsStringAsync(image, {
  //         encoding: FileSystem.EncodingType.Base64,
  //       });
  //     }

  //     const uriparts = image.split(".");
  //     const fileExtension =
  //       uriparts[uriparts.length - 1]?.toLowerCase() || "jpeg";
  //     const cleanImageType = fileExtension === "jpg" ? "jpeg" : fileExtension;

  //     const payload = {
  //       title: title.trim(),
  //       caption: caption.trim(),
  //       rating: rating.toString(),
  //       imageFile: `data:image/${cleanImageType};base64,${base64Data}`,
  //     };

  //     const response = await fetch(`${API_URL}/books`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Accept: "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //       body: JSON.stringify(payload),
  //     });

  //     if (!response.ok) {
  //       const contentType = response.headers.get("content-type");
  //       let errorMessage = "Something went wrong";

  //       try {
  //         if (contentType && contentType.includes("application/json")) {
  //           const data = await response.json();
  //           errorMessage = data.message || errorMessage;
  //         } else {
  //           errorMessage = `Server error (${response.status}): ${response.statusText}`;
  //         }
  //       } catch (parseError) {
  //         errorMessage = `Server error (${response.status})`;
  //       }

  //       throw new Error(errorMessage);
  //     }

  //     const data = await response.json();
  //     console.log("Book successfully created:", data);

  //     Alert.alert("Success", "Your book recommendation has been posted!");
  //     setTitle("");
  //     setCaption("");
  //     setRating(3);
  //     setImage(null);
  //     setImageBase64(null);
  //     router.push("/");
  //   } catch (error) {
  //     console.log("Error creating the post:", error);
  //     let errorMsg = error.message || "Something went wrong";
  //     if (error.name === "AbortError") {
  //       errorMsg =
  //         "Request timeout. Please check your internet connection and try again.";
  //     }
  //     Alert.alert("Error", errorMsg);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const handleSubmit = async () => {
  //   // 1. Clean and log inputs to ensure nothing is missing locally
  //   const cleanTitle = title ? title.trim() : "";
  //   const cleanCaption = caption ? caption.trim() : "";
  //   const numericRating = Number(rating);

  //   if (!cleanTitle || !cleanCaption || !image || !numericRating) {
  //     Alert.alert("Error", "Please fill in all fields before submitting!");
  //     return;
  //   }

  //   try {
  //     setLoading(true);

  //     // 2. Fetch the Base64 image data string safely
  //     let base64Data = imageBase64;
  //     if (!base64Data) {
  //       console.log("Reading image data from local URI path...");
  //       base64Data = await FileSystem.readAsStringAsync(image, {
  //         encoding: FileSystem.EncodingType.Base64,
  //       });
  //     }

  //     if (!base64Data) {
  //       Alert.alert(
  //         "Error",
  //         "Could not process image file. Please try selecting it again.",
  //       );
  //       return;
  //     }

  //     const uriparts = image.split(".");
  //     const fileExtension =
  //       uriparts[uriparts.length - 1]?.toLowerCase() || "jpeg";
  //     const cleanImageType = fileExtension === "jpg" ? "jpeg" : fileExtension;

  //     // 3. Match keys EXACTLY with backend destructuring
  //     const payload = {
  //       title: cleanTitle,
  //       caption: cleanCaption,
  //       rating: numericRating, // Sent as a pure Number
  //       imageFile: `data:image/${cleanImageType};base64,${base64Data}`,
  //     };

  //     console.log("Sending clean payload fields to server...");

  //     const response = await fetch(`${API_URL}/books`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Accept: "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //       body: JSON.stringify(payload),
  //     });

  //     // 4. Handle exact server error responses
  //     if (!response.ok) {
  //       const contentType = response.headers.get("content-type");
  //       let errorMessage = "Something went wrong";

  //       try {
  //         if (contentType && contentType.includes("application/json")) {
  //           const data = await response.json();
  //           // If backend provided details about what is missing, show it
  //           if (data.details) {
  //             console.log("Missing fields detail:", data.details);
  //           }
  //           errorMessage = data.message || errorMessage;
  //         } else {
  //           errorMessage = `Server error (${response.status}): ${response.statusText}`;
  //         }
  //       } catch (parseError) {
  //         errorMessage = `Server error (${response.status})`;
  //       }

  //       throw new Error(errorMessage);
  //     }

  //     const data = await response.json();
  //     console.log("Book successfully created:", data);

  //     Alert.alert("Success", "Your book recommendation has been posted!");
  //     setTitle("");
  //     setCaption("");
  //     setRating(3);
  //     setImage(null);
  //     imageBase64(null);
  //     router.push("/");
  //   } catch (error) {
  //     console.log("Error creating the post:", error);
  //     Alert.alert("Error", error.message || "Something went wrong");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // checking

  // const pickImage = async () => {
  //   try {
  //     if (Platform.OS !== "web") {
  //       const { status } =
  //         await ImagePicker.requestMediaLibraryPermissionsAsync();
  //       if (status !== "granted") {
  //         Alert.alert("Permission Denied", "We need camera roll permission.");
  //         return;
  //       }
  //     }

  //     const result = await ImagePicker.launchImageLibraryAsync({
  //       mediaTypes: "images",
  //       allowsEditing: true,
  //       aspect: [4, 3],
  //       quality: 0.4, // Balanced level
  //       base64: true,
  //     });

  //     if (!result.canceled) {
  //       const selected = result.assets;
  //       setImage(selected.uri);

  //       if (selected.base64) {
  //         setImageBase64(selected.base64);
  //       } else {
  //         const base64 = await FileSystem.readAsStringAsync(selected.uri, {
  //           encoding: FileSystem.EncodingType.Base64,
  //         });
  //         setImageBase64(base64);
  //       }
  //     }
  //   } catch (error) {
  //     Alert.alert("Error", "Problem selecting your image");
  //   }
  // };

  const pickImage = async () => {
    try {
      if (Platform.OS !== "web") {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== "granted") {
          Alert.alert(
            "Permission Denied",
            "We need camera roll permission to upload an image",
          );
          return;
        }
      }

      // 1. FIXED: Added correct array bounds back to aspect ratio configuration
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions?.Images || "images",
        allowsEditing: true,
        aspect: [4, 3], // Ensure this is an array of two numbers
        quality: 0.4,
        base64: true,
      });

      // 2. FIXED: Cross-check both modern arrays and legacy single asset returns safely
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selected = result.assets[0];

        if (!selected.uri) {
          Alert.alert("Error", "Could not resolve file path from selection.");
          return;
        }

        setImage(selected.uri);

        // 3. Fallback to FileSystem extraction if base64 key is missing
        if (selected.base64) {
          setImageBase64(selected.base64);
          console.log("Base64 loaded successfully from picker asset.");
        } else {
          console.log(
            "Base64 missing from asset, reading manually from URI...",
          );
          const base64 = await FileSystem.readAsStringAsync(selected.uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          setImageBase64(base64);
        }
      }
    } catch (error) {
      console.log("Detailed Error in picking Image:", error);
      Alert.alert(
        "Error",
        `Problem selecting your image: ${error.message || error}`,
      );
    }
  };

  // const handleSubmit = async () => {
  //   const cleanTitle = title ? title.trim() : "";
  //   const cleanCaption = caption ? caption.trim() : "";
  //   const numericRating = Number(rating);

  //   // 1. Force check the Base64 state right now
  //   let base64Data = imageBase64;
  //   if (!base64Data && image) {
  //     try {
  //       base64Data = await FileSystem.readAsStringAsync(image, {
  //         encoding: FileSystem.EncodingType.Base64,
  //       });
  //     } catch (e) {
  //       console.log("FileSystem reading failed:", e);
  //     }
  //   }

  //   // 2. DIAGNOSTIC ALERT: This shows us exactly what is empty before sending
  //   Alert.alert(
  //     "Data Diagnosis Check",
  //     `Title: ${cleanTitle ? "✅ OK" : "❌ EMPTY"}\n` +
  //       `Caption: ${cleanCaption ? "✅ OK" : "❌ EMPTY"}\n` +
  //       `Rating: ${numericRating ? "✅ OK" : "❌ EMPTY"}\n` +
  //       `Image URI: ${image ? "✅ OK" : "❌ EMPTY"}\n` +
  //       `Base64 String: ${base64Data ? "✅ OK" : "❌ EMPTY"}`,
  //   );

  //   if (
  //     !cleanTitle ||
  //     !cleanCaption ||
  //     !image ||
  //     !numericRating ||
  //     !base64Data
  //   ) {
  //     setLoading(false);
  //     return; // Stop here if anything is missing
  //   }

  //   try {
  //     setLoading(true);

  //     const uriparts = image.split(".");
  //     const fileExtension =
  //       uriparts[uriparts.length - 1]?.toLowerCase() || "jpeg";
  //     const cleanImageType = fileExtension === "jpg" ? "jpeg" : fileExtension;

  //     const payload = {
  //       title: cleanTitle,
  //       caption: cleanCaption,
  //       rating: numericRating,
  //       imageFile: `data:image/${cleanImageType};base64,${base64Data}`,
  //     };

  //     const response = await fetch(`${API_URL}/books`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Accept: "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //       body: JSON.stringify(payload),
  //     });

  //     if (!response.ok) {
  //       const contentType = response.headers.get("content-type");
  //       let errorMessage = "Something went wrong";
  //       try {
  //         if (contentType && contentType.includes("application/json")) {
  //           const data = await response.json();
  //           errorMessage = data.message || errorMessage;
  //         } else {
  //           errorMessage = `Server error (${response.status})`;
  //         }
  //       } catch (parseError) {
  //         errorMessage = `Server error (${response.status})`;
  //       }
  //       throw new Error(errorMessage);
  //     }

  //     const data = await response.json();
  //     Alert.alert("Success", "Your book recommendation has been posted!");
  //     setTitle("");
  //     setCaption("");
  //     setRating(3);
  //     setImage(null);
  //     setImageBase64(null);
  //     router.push("/");
  //   } catch (error) {
  //     Alert.alert("Error", error.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSubmit = async () => {
    // 1. Ensure all local states have fallback values so they never send undefined
    const cleanTitle = title ? title.trim() : "";
    const cleanCaption = caption ? caption.trim() : "";

    // Convert rating to a clean string because backend might be checking for presence of string data
    const ratingString = rating ? rating.toString() : "3";

    if (!cleanTitle || !cleanCaption || !image) {
      Alert.alert("Error", "Please fill in all the text fields!");
      return;
    }

    try {
      setLoading(true);

      let base64Data = imageBase64;
      if (!base64Data) {
        base64Data = await FileSystem.readAsStringAsync(image, {
          encoding: FileSystem.EncodingType.Base64,
        });
      }

      if (!base64Data) {
        Alert.alert(
          "Error",
          "Image content processing failed. Re-select your image.",
        );
        setLoading(false);
        return;
      }

      const uriparts = image.split(".");
      const fileExtension =
        uriparts[uriparts.length - 1]?.toLowerCase() || "jpeg";
      const cleanImageType = fileExtension === "jpg" ? "jpeg" : fileExtension;

      // 2. CRITICAL MATCH: Send EXACTLY what your backend destructures:
      // const { title, caption, rating, imageFile } = req.body;
      const payload = {
        title: cleanTitle,
        caption: cleanCaption,
        rating: ratingString,
        imageFile: `data:image/${cleanImageType};base64,${base64Data}`,
      };

      const response = await fetch(`${API_URL}/books`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        let errorMessage = "Something went wrong";

        try {
          if (contentType && contentType.includes("application/json")) {
            const data = await response.json();
            // If our detailed backend response has a fields breakdown, show it!
            if (data.details) {
              console.log("Missing breakdown:", data.details);
              errorMessage = `${data.message}\nMissing: ${JSON.stringify(data.details)}`;
            } else {
              errorMessage = data.message || errorMessage;
            }
          } else {
            errorMessage = `Server error (${response.status})`;
          }
        } catch (parseError) {
          errorMessage = `Server error (${response.status})`;
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("Post successful!", data);

      Alert.alert("Success", "Your book recommendation has been posted!");
      setTitle("");
      setCaption("");
      setRating(3);
      setImage(null);
      setImageBase64(null);
      router.push("/");
    } catch (error) {
      console.log("Submission error details:", error);
      Alert.alert("Submission Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderRatingPicker = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => setRating(i)}
          style={styles.starButton}
        >
          <Ionicons
            name={i <= rating ? "star" : "star-outline"}
            size={32}
            color={i <= rating ? "#f4b400" : COLORS.textSecondary}
          />
        </TouchableOpacity>,
      );
    }
    return <View style={styles.ratingContainer}>{stars}</View>;
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        style={styles.scrollViewStyle}
      >
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Add Book Recommendation</Text>
            <Text style={styles.subtitle}>
              Share your favourite reads with others
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Book Title</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="book-outline"
                  size={20}
                  color={COLORS.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter book title"
                  placeholderTextColor={COLORS.placeholderText}
                  value={title}
                  onChangeText={setTitle}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Your Rating</Text>
              {renderRatingPicker()}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Book Image</Text>
              <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                {image ? (
                  <Image source={{ uri: image }} style={styles.previewImage} />
                ) : (
                  <View style={styles.placeholderContainer}>
                    <Ionicons
                      name="image-outline"
                      size={40}
                      color={COLORS.textSecondary}
                    />
                    <Text style={styles.placeholderText}>
                      Tap to select image
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Caption / Description</Text>
              <TextInput
                style={[
                  styles.input,
                  { height: 100, textAlignVertical: "top" },
                ]}
                placeholder="Why do you recommend this book?"
                placeholderTextColor={COLORS.placeholderText}
                value={caption}
                onChangeText={setCaption}
                multiline={true}
              />
            </View>

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>
                  Submit Recommendation
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
