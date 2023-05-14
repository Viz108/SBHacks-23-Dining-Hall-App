// import { StatusBar } from 'expo-status-bar';
// import { StyleSheet, Text, View } from 'react-native';

// export default function App() {
//   return (
//     <View style={styles.container}>
//       <Text>Open up App.js to start working on your app!</Text>
//       <StatusBar style="auto" />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
// });


import React, { useState } from 'react';
import { Button, Image, TextInput, View, Text } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { Rating } from 'react-native-ratings';
import axios from 'axios';
import ImagePicker from 'react-native-image-picker';
import mongoose from 'mongoose';

//const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  title: { type: String, required: true },
  datePosted: { type: Date, default: Date.now },
  rating: { type: Number, required: true, min: 1, max: 5 },
  image: { type: String, required: true }
});

const Review = mongoose.model('Review', reviewSchema);

const AddReviewScreen = () => {
  const [image, setImage] = useState(null);
  const { control, handleSubmit, formState: { errors }, reset } = useForm();

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: image.uri,
        type: 'image/jpeg',
        name: 'review.jpg',
      });
      formData.append('title', data.title);
      formData.append('rating', parseInt(data.rating, 10));

      await axios.post('http://localhost:3000/reviews', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Clear form and image state
      setImage(null);
      reset();
    } catch (error) {
      console.error(error);
    }
  };

  const openImagePicker = async () => {
    const options = {
      title: 'Select Image',
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };
  
    ImagePicker.showImagePicker(options, (response) => { //show camera roll and allow user to select image
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } else {
        const source = { uri: response.uri };
        setImage(source);
      }
    });
  };

  return (
    <View>
      <Controller
        control={control}
        rules={{ required: true }}
        render={({ field }) => (
          <TextInput
            {...field}
            placeholder="Enter a title"
            style={{ height: 40 }}
          />
        )}
        name="title"
        defaultValue=""
      />
      {errors.title && <Text>This field is required</Text>}

      <Controller
        control={control}
        rules={{ required: true }}
        render={({ field }) => (
          <Rating
            {...field}
            ratingCount={5}
            imageSize={30}
            showRating
            onFinishRating={field.onChange}
          />
        )}
        name="rating"
        defaultValue={1}
      />
      {errors.rating && <Text>This field is required</Text>}

      <Button title="Pick an image" onPress={openImagePicker} />

      {image && <Image source={{ uri: image.uri }} style={{ width: 200, height: 200 }} />}

      <Button title="Submit review" onPress={handleSubmit(onSubmit)} />
    </View>
  );
};

export default AddReviewScreen;



