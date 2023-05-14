import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, ScrollView, View, TextInput, TouchableOpacity, AsyncStorage, Keyboard, Image } from 'react-native';
import { styles } from './notesstyles';
import * as ImagePicker from 'expo-image-picker';
import ReactMarkdown from 'react-native-markdown-display';
import { FontAwesome } from '@expo/vector-icons';

const STORAGE_KEY = '@notes';

export default function App() {
  const [activeTab, setActiveTab] = useState('De La Guerra');
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [currentNoteIndex, setCurrentNoteIndex] = useState(null);
  const [rating, setRating] = useState(0);

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
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.cancelled) {
      setBody(body => `${body}\n\n![image](${result.uri})`);
    }
  };
  
  const handleAddNote = () => {
    const newNote = { title, body, tab: activeTab, rating };
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
    setRating(0);
  };

  const handleEditNote = (index) => {
    const updatedNotes = [...notes];
    updatedNotes[index].time = new Date().getTime();
    setNotes(updatedNotes);
    setTitle(updatedNotes[index].title);
    setBody(updatedNotes[index].body);
    setRating(updatedNotes[index].rating || 0);
  };

  const handleDeleteNote = (index) => {
    const updatedNotes = [...notes];
    updatedNotes.splice(index, 1);
    setNotes(updatedNotes);
  };

  const filteredNotes = notes.filter((note) => note.tab === activeTab);

  const renderRatingStars = () => {
    const stars = [];

    for (let i = 1; i <= 5; i++) {
      const filled = i <= rating;
      const starColor = filled ? '#FFD64C' : '#BBBBBB';

      stars.push(
        <TouchableOpacity key={i} onPress={() => setRating(i)}>
          <FontAwesome name={filled ? 'star' : 'star-o'} size={24} color={starColor} />
        </TouchableOpacity>
      );
    }

    return (
      <View style={styles.ratingContainer}>
        {stars}
      </View>
    );
  };

  return (
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
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TextInput
          style={styles.titleInput}
          placeholder="Title"
          value={title}
          onChangeText={(text) => setTitle(text)}
        />
        <View style={{ flexDirection: 'row', marginLeft: 10 }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => setRating(star)}>
              <FontAwesome name={star <= rating ? 'star' : 'star-o'} size={20} color="orange" />
            </TouchableOpacity>
          ))}
        </View>
      </View>
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
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.noteTitle}>{note.title}</Text>
              {[1, 2, 3, 4, 5].map((star) => (
                <FontAwesome key={star} name={star <= note.rating ? 'star' : 'star-o'} size={20} color="orange" />
              ))}
            </View>
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
);
}
