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


import React, { useState, useEffect } from 'react';

import { StyleSheet, ScrollView, TouchableOpacity, Keyboard, Button, Image, TextInput, View, Text } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { Rating } from 'react-native-ratings';
import axios from 'axios';
import ImagePicker from 'react-native-image-picker';
import mongoose from 'mongoose';


import AsyncStorage from '@react-native-async-storage/async-storage'
import { styles } from './notesstyles';
import * as ImagePicker2 from 'expo-image-picker';
import ReactMarkdown from 'react-native-markdown-display';

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

  const STORAGE_KEY = '@notes';


  const [activeTab, setActiveTab] = useState('De La Guerra');
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [currentNoteIndex, setCurrentNoteIndex] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((savedNotes) => {
      if (savedNotes) {
        setNotes(JSON.parse(savedNotes));
      }
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  const handleAddImage = async () => {
    const { status } = await ImagePicker2.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    const result = await ImagePicker2.launchImageLibraryAsync({
      mediaTypes: ImagePicker2.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.cancelled) {
      setBody(body => `${body}\n\n![image](${result.uri})`);
    }
  };
  
  const handleAddNote = () => {
    const newNote = { title, body, tab: activeTab };
    if (currentNoteIndex !== null) {
      const updatedNotes = [...notes];
      updatedNotes[currentNoteIndex] = newNote;
      setNotes(updatedNotes);
      setCurrentNoteIndex(null);
    } else {
      setNotes([...notes, newNote]);
    }
    setTitle('');
    setBody('');
  };

  const handleEditNote = (index) => {
    const updatedNotes = [...notes];
    updatedNotes[index].time = new Date().getTime();
    setNotes(updatedNotes);
    setTitle(updatedNotes[index].title);
    setBody(updatedNotes[index].body);
  };

  const handleDeleteNote = (index) => {
    const updatedNotes = [...notes];
    updatedNotes.splice(index, 1);
    setNotes(updatedNotes);
  };

  const filteredNotes = notes.filter((note) => note.tab === activeTab);

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

      <View style={styles.container}>
    <View style={styles.tabContainer}>
      <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity style={activeTab === 'de_la_guerra' ? styles.activeTab : styles.tab} onPress={() => setActiveTab('de_la_guerra')}>
          <Text style={styles.tabText}>De la Guerra</Text>
        </TouchableOpacity>
        <TouchableOpacity style={activeTab === 'carrillo' ? styles.activeTab : styles.tab} onPress={() => setActiveTab('carrillo')}>
          <Text style={styles.tabText}>Carrillo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={activeTab === 'portola' ? styles.activeTab : styles.tab} onPress={() => setActiveTab('portola')}>
          <Text style={styles.tabText}>Portola</Text>
        </TouchableOpacity>
        <TouchableOpacity style={activeTab === 'ortega' ? styles.activeTab : styles.tab} onPress={() => setActiveTab('ortega')}>
          <Text style={styles.tabText}>Ortega</Text>
        </TouchableOpacity>
      </View>
    </View>
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.titleInput}
        placeholder="Title"
        value={title}
        onChangeText={(text) => setTitle(text)}
      />
      <TextInput
        style={styles.bodyInput}
        placeholder="Body"
        value={body}
        onChangeText={(text) => setBody(text)}
        multiline={true}
        onSubmitEditing={() => Keyboard.dismiss()}
      />
      <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity style={styles.addButton} onPress={handleAddNote}>
          <Text style={styles.addButtonText}>{currentNoteIndex !== null ? 'Save' : 'Add'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addButton} onPress={handleAddImage}>
          <Text style={styles.addButtonText}>Add Image</Text>
        </TouchableOpacity>
      </View>
    </View>
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.notesContainer}>
        {filteredNotes.map((note, index) => (
          <TouchableOpacity key={index} style={styles.noteContainer} onPress={() => handleEditNote(index)}>
            <Text style={styles.noteTitle}>{note.title}</Text>
            <ReactMarkdown>{note.body}</ReactMarkdown>
            <TouchableOpacity style={styles.editButton} onPress={() => handleEditNote(index)}>
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteNote(index)}>
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  </View>
    </View>

    
  );
};

export default AddReviewScreen;




