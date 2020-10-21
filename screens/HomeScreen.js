import React, {useState, useEffect} from 'react';
import { AsyncStorage, StyleSheet, ImageBackground, Text } from 'react-native';

import {Button, Input} from 'react-native-elements'
import Icon from 'react-native-vector-icons/FontAwesome';

import {connect} from 'react-redux';

function HomeScreen({ navigation, onSubmitPseudo }) {
    const [pseudo, setPseudo] = useState('');
    const [isPseudo, setIsPseudo] = useState(false);
    
    useEffect(() => {

      AsyncStorage.getItem("pseudo",
        function(error, data){
          if(data != null){
            setIsPseudo(true)
            setPseudo(data);
            onSubmitPseudo(pseudo); // peut foirer à cause de l'asynchronie ?
          }
        }
      )
    }, [])
    var welcome; 
    if(isPseudo){
      welcome =
    <Text>Welcome back {pseudo}</Text>
    } else {
      welcome =
      <Input
            containerStyle = {{marginBottom: 25, width: '70%'}}
            inputStyle={{marginLeft: 10}}
            placeholder='John'
            leftIcon={
                <Icon
                name='user'
                size={24}
                color="#eb4d4b"
                />
            }
            onChangeText={(val) => setPseudo(val)}
        />
    }
    return (
    <ImageBackground source={require('../assets/home.jpg')} style={styles.container}>

        {welcome}

        <Button
            icon={
                <Icon
                name="arrow-right"
                size={20}
                color="#eb4d4b"
                />
            }

            title="Go to Map"
            type="solid"
            onPress={() => {AsyncStorage.setItem("pseudo", pseudo); onSubmitPseudo(pseudo); navigation.navigate('Map')}}
            buttonStyle={{ marginBottom: 10 }}
        />
        <Button
            title="Clear Storage"
            type="solid"
            onPress={() => {AsyncStorage.clear();}}
        />

    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});


function mapDispatchToProps(dispatch) {
    return {
      onSubmitPseudo: function(pseudo) { 
        dispatch( {type: 'savePseudo', pseudo: pseudo }) 
      }
    }
  }
  
  export default connect(
      null, 
      mapDispatchToProps
  )(HomeScreen);