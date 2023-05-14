import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, ScrollView, View, TextInput, TouchableOpacity, AsyncStorage, Keyboard, Image } from 'react-native';
import { styles } from './notesstyles';
import * as ImagePicker from 'expo-image-picker';
import ReactMarkdown from 'react-native-markdown-display';

const STORAGE_KEY = '@notes';

export default function App() {
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
);
}