import React, {Component, Fragment} from 'react'
import {StyleSheet, Text, TextInput, View, Button, ScrollView, Slider} from 'react-native'
import Markdown from 'react-native-markdown-renderer'
import { Audio } from 'expo'
//import Sound from 'react-native-sound'
import {styles, mdStyle} from './style.js'
import settings from './settings.json'
import tree from './finaltree.json'
import audio from './assets/audio/index.js'
//import { library } from '@fortawesome/fontawesome-svg-core'
//import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
//import { faIgloo } from '@fortawesome/free-solid-svg-icons'
//import FontAwesome, { Icons, IconTypes } from 'react-native-fontawesome';
import { AntDesign, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';

function replaceVariables (node) {
  const str = settings.primarycontact || ''
  for(i in tree) {
    tree[i].content = tree[i].content.replace(/\$CONTACTPERSOON/g, str)
  }
  //if (node.options) {
    //for (const i of node.options) replaceVariables(i)
  //}
}
replaceVariables(tree)

export default class App extends Component {

  constructor (props) {
    super(props)

    this.state = {
      node: tree[0],
      //history: [tree],
      json: tree,
      audioToggle: false,
      settingsToggle: false,
      contact: settings.primarycontact,
      oldContact: settings.primarycontact,
      volume: 0.5,
      soundObject: null,
      asrc: null,
      asrcModifier: null,
      isPlaying: null,
    }

    this.goToNode = this.goToNode.bind(this)
    this.handleContactInput = this.handleContactInput.bind(this)
    this.handleVolumeInput = this.handleVolumeInput.bind(this)
    this.setAudio = this.setAudio.bind(this)
    this.audioContinue = this.audioContinue.bind(this)

    //this.toggleSettings = this.toggleSettings.bind(this)//
    //this.goBack = this.goBack.bind(this)
  }
  // audio invoer
  async setAudio(i) {
    //console.log('load' + this.state.soundObject)
    this.state.soundObject = new Audio.Sound();
    if (this.state.soundObject.isLoaded) {
      this.state.soundObject.unloadAsync()
    }
    try {
      await this.state.soundObject.loadAsync(audio[i]);
      await this.state.soundObject.setVolumeAsync(this.state.volume)
    } catch (error) {
      console.log(error)
    }
    //console.log('loaded' + this.state.soundObject)
  }
  async playAudio(i) {
    //console.log('play')
    try {
      await this.setAudio(i)
      await this.state.soundObject.playAsync();
      this.state.soundObject.setOnPlaybackStatusUpdate(this._onPlaybackStatusUpdate);
    } catch (error) {
      console.log(error)
    }
    this.setState({volume: this.state.volume})
  }

  _onPlaybackStatusUpdate = playbackStatus => {
      if (playbackStatus.didJustFinish) {
        this.state.asrcModifier += 1
        if (audio[this.state.asrc[this.state.asrcModifier]]) {
          console.log(this.state.asrc[this.state.asrcModifier])
          x = this.state.asrc[this.state.asrcModifier]
          //this.setAudio(x)
          this.playAudio(x)
        } else {
          this.state.asrcModifier = 0
          this.setState({audioToggle: false})
          //console.log('complete')
        }
      }
  }
  async stopAudio() {
    if (this.state.audioToggle) {
      if (this.state.soundObject.isLoaded !== null) {
        try {
          //console.log('stopping')
          await this.state.soundObject.stopAsync();
        } catch (error) {
          console.log(error)
        }
      }
    }
    this.state.asrcModifier = null
    this.setState({audioToggle: false})
  }

  async toggleAudio (asrc) {
    if(this.state.audioToggle !== true ) {
      //console.log('started')
      this.state.asrcModifier = 0
      this.state.asrc = asrc
      this.playAudio(asrc[0])
      this.state.audioToggle = true
    } else {
      this.stopAudio()
      this.state.audioToggle = false
    }
  }
  async audioContinue() {
    if (this.state.node.children) {
      for (i in this.state.node.children) {

      }
    }
  }
  toggleSettings() {
    if(this.state.settingsToggle !== true ) {
      this.setState({settingsToggle: true})
    } else {
      this.setState({settingsToggle: false})
      this.replaceVariables(this.state.json)
    }
  }
  replaceVariables(node) {
    const str = this.state.contact || ''
    const old = this.state.oldContact || ''
    for(i in node) {
      node[i].content = tree[i].content.replace(/\$CONTACTPERSOON/g, str)
      node[i].content = tree[i].content.replace(old, str)
    }
    this.state.oldContact = str
  }
  debug() {
    console.log(this.state.node)
    console.log('audio', this.state.audioToggle)
    console.log('settings', this.state.settingsToggle)
    console.log('contact', this.state.contact)
    console.log('old', this.state.oldContact)
    console.log('volume', this.state.volume)
    console.log('asrc', this.state.asrc)
    console.log('asrcModifier', this.state.asrcModifier)
    console.log('isPlaying', this.state.isPlaying)

  }

  findNode (id){
    let {node, json} = this.state;
    return json.filter(
      function(data){
        return data.id == id;
      }
    )[0]
  }
  goToNode (newNode) {
    let {node,json} = this.state
    //history = history.slice()
    newNode = this.findNode(newNode)
    // history[history.indexOf(node) + 1] = newNode
    this.stopAudio()
    this.setState({node: newNode})

    /*if(this.state.audioToggle == true ) {
      this.playAudio()
    }*/
  }

  /*goBack () {
    const {node, history, json} = this.state
    const i = history.indexOf(node)
    if (i && i > 0) {
      this.goToNode(history[i - 1])
    }
  }   */

  handleContactInput(inp) {
    this.setState({contact: inp})
    settings.primarycontact = inp
  }
  handleVolumeInput(inp) {
    this.setState({volume: inp})
    this.state.soundObject.setVolumeAsync(inp)
  }

  render () {
    const {node, json} = this.state
    const buttons = []
    //console.log(node.parent)
    var backButton = null;
    if(node.parent !== null){
      backButton =
      <Button
        style={styles.button}
        title="terug"
        onPress={() => this.goToNode(node.parent)}
      />
    }
    var audioButton =
    <MaterialCommunityIcons
      name={'voice'}
      style={styles.icons}
      color='#fff'
      />
    var audioId = ['text'+this.state.node.id]
    for (x in this.state.isPlaying){
      this.state.isPlaying.pop()
    }
    this.state.isPlaying = [this.state.node.id]
    if (this.state.node.children) {
      for (i in this.state.node.children) {
        audioId.push('title'+this.state.node.children[i])
        this.state.isPlaying.push(this.state.node.children[i])
      }
    }
    if(this.state.volume !== 0 && typeof audio[audioId[0]] !== 'undefined'){
      audioButton =
      <MaterialCommunityIcons
        name={'voice'}
        style={styles.icons}
        onPress ={() => this.toggleAudio(audioId)}
      />
    }
    var settingsButton =
    <FontAwesome
      name={'cog'}
      style={styles.icons}
      onPress={() => this.toggleSettings()}
    />
    var settingsBackButton =
    <AntDesign
      name={'back'}
      style={styles.icons}
      onPress={() => this.toggleSettings()}
    />
    var debugButton =
    <Button
      style={styles.buttonMarked}
      title="debug"
      onPress ={() => this.debug()}
    />
    if (node.children && node.children instanceof Array) {
      for (const i of node.children) {
        let child = this.findNode(i);
        //console.log(i)
        if (i == this.state.isPlaying[this.state.asrcModifier]) {
          buttons.push(
            <Button
              //style={styles.button}
              color='purple'
              title={child.title}
              onPress={() => this.goToNode(child.id)}
              key={child.id}
            />
          )
        } else {
          buttons.push(
            <Button
              //style={styles.button}
              title={child.title}
              onPress={() => this.goToNode(child.id)}
              key={child.id}
            />
          )
        }
      }
    }
    var contactInput =
    <View style={styles.buttonGroup}>
      <Text style={styles.text}>
        Telefoon nummer contactpersoon:
      </Text>
      <TextInput
        style = {styles.inputField}
        keyboardType = 'numeric'
        placeholder = {this.state.contact}
        value = {this.state.contact}
        placeholderTextColor = "#888888"
        autoCapitalize = "none"
        onChangeText = {this.handleContactInput}
      />
    </View>
    var volumeSlider =
    <View style={styles.buttonGroup}>
      <Text style={styles.text}>
        Volume voorleesfunctie:
      </Text>
      <View style={styles.horizontal}>
      <FontAwesome  name={'volume-down'}  style={styles.icons}/>
      <Slider
        style={styles.slider}
        value={this.state.volume}
        step={0.05}
        onSlidingComplete={this.handleVolumeInput}
      />
      <FontAwesome  name={'volume-up'}  style={styles.icons}/>
      </View>
    </View>

    return (
      <ScrollView contentContainerStyle={styles.container}>
        {this.state.settingsToggle ||(
        <View style={styles.messageArea}>
          <Markdown style={mdStyle}>
            {node.content || ''}
          </Markdown>
        </View>
        )}
        {this.state.settingsToggle ||(
        <View style={styles.buttonGroup}>
          {buttons}
        </View>
        )}
        {this.state.settingsToggle ||(
        <View style={styles.backButtonGroup}>
          {settingsButton}
          {backButton}
          {audioButton}
        </View>
        )}
        {this.state.settingsToggle && (
          <View style={styles.messageArea}>
            <Markdown style={mdStyle}>
              {'Instellingen'}
            </Markdown>
          </View>
        )}
        {this.state.settingsToggle && (
        <View style={styles.buttonGroup}>
          {contactInput}
          {volumeSlider}
          {debugButton}
        </View>
        )}
        {this.state.settingsToggle && (
        <View style={styles.backButtonGroup}>
          {settingsBackButton}
        </View>
        )}
      </ScrollView>
    )
  }
}
