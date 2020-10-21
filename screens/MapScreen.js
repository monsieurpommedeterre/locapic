import React, {useState, useEffect} from 'react';
import { AsyncStorage, View } from 'react-native';
import {Button, Overlay, Input} from 'react-native-elements'
import Icon from 'react-native-vector-icons/FontAwesome';

import MapView,{Marker} from 'react-native-maps';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';

import socketIOClient from "socket.io-client";
 
import {connect} from 'react-redux';

var socket = socketIOClient("http://192.168.1.45:3000");

function MapScreen({ pseudo }) {

  const [currentLatitude, setCurrentLatitude] = useState(0);
  const [currentLongitude, setCurrentLongitude] = useState(0);
  const [addPOI, setAddPOI] = useState(false);
  const [listPOI, setListPOI] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  
  const [titrePOI, setTitrePOI] = useState();
  const [descPOI, setDescPOI] = useState();
  
  const [tempPOI, setTempPOI] = useState();
  const [listUserPos, setListUserPos] = useState([]);

  useEffect(() => {
   AsyncStorage.getItem("myPOIS",
    function(error, data){
      if(data != null){
        console.log("mes ptits POIS", JSON.parse(data));
        setListPOI(JSON.parse(data));
      }
    }
   )
    async function askPermissions() {
      let { status } = await Permissions.askAsync(Permissions.LOCATION);
      if (status === 'granted') {
        Location.watchPositionAsync({distanceInterval: 2},
          (location) => {
             setCurrentLatitude(location.coords.latitude)
             setCurrentLongitude(location.coords.longitude);
             socket.emit("sendPos", {name: pseudo, latitude: location.coords.latitude, longitude: location.coords.longitude});
             console.log("tu as bougé")
          }
        );
      }
    }
    askPermissions();
  }, []);
  useEffect(()=>{
    socket.on('sendPosToAll', (newUserPos)=> {
      var testIndex2 = [
        {name: 'Mike', plus: 'Do'},
        {name: 'Burger', plus: 'wah'},
        {name: 'Hotdog', plus: 'damn'}
      ]
      var testIndex = listUserPos.findIndex((e)=>(e.name===newUserPos.name));
      if(testIndex!=-1){
        console.log('user déjà présent')
        console.log('test index', testIndex)
        console.log("listUserPos", listUserPos)
        var tempUserPos = [...listUserPos];
        tempUserPos[testIndex].longitude = newUserPos.longitude;
        tempUserPos[testIndex].latitude = newUserPos.latitude;
        setListUserPos(tempUserPos);
      } else {
        console.log("voilà du nouveau mon coco")
        console.log('test index', testIndex)
        console.log("listUserPos", listUserPos)
        setListUserPos([...listUserPos, newUserPos]);
      }
      console.log("nb de users dans le tab", listUserPos.length)
    });
},[listUserPos]);

  var selectPOI = (e) => {
    if(addPOI){
      setAddPOI(false);
      setIsVisible(true);
      setTempPOI({ latitude: e.nativeEvent.coordinate.latitude, longitude:e.nativeEvent.coordinate.longitude } );
    }
  }

  var handleSubmit = () => {
    var maListePOI = [...listPOI]; // j'aurais pu directement mettre le contenu du push dès cette étape
    maListePOI.push({longitude: tempPOI.longitude, latitude: tempPOI.latitude, titre: titrePOI, description: descPOI });
    console.log("ma liste en cours", maListePOI);
    AsyncStorage.setItem("myPOIS", JSON.stringify(maListePOI));
    setListPOI([...listPOI, {longitude: tempPOI.longitude, latitude: tempPOI.latitude, titre: titrePOI, description: descPOI } ]);
    setIsVisible(false);
    setTempPOI();
    setDescPOI();
    setTitrePOI();
  }

  
  var markerPOI = listPOI.map((POI, i)=>{
    return <Marker key={i} pinColor="blue" coordinate={{latitude: POI.latitude, longitude: POI.longitude}}
        title={POI.titre}
        description={POI.description}
        />
  });

  var userMarkers = listUserPos.map((element, i)=>{
    return <Marker key={i} pinColor="red" coordinate={{latitude: element.latitude, longitude: element.longitude}}
        title={element.name}
        description={element.name}
        />
  })
  var isDisabled = false;
  if(addPOI) {
    isDisabled = true;
  }

  return (
      <View style={{flex : 1}} >
        <Overlay
     isVisible={isVisible}
     onBackdropPress={() => {setIsVisible(false)}}
   >
        <View>
       <Input
            containerStyle = {{marginBottom: 25}}
            placeholder='titre'
            onChangeText={(val) => setTitrePOI(val)}
      
        />

        <Input
            containerStyle = {{marginBottom: 25}}
            placeholder='description'
            onChangeText={(val) => setDescPOI(val)}
    
        />
 
      <Button
         title= "Ajouter POI"
         buttonStyle={{backgroundColor: "#eb4d4b"}}
         onPress={() => handleSubmit()}
         type="solid"
       />
      </View>
   </Overlay>

        <MapView 
          onPress={(e) => {selectPOI(e)}}
          style={{flex : 1}} 
          initialRegion={{
            latitude: 48.866667,
            longitude: 2.333333,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          {userMarkers}  
          {markerPOI}
        </MapView>
        <Button 
        disabled={isDisabled}
        title="Add POI" 
        icon={
          <Icon
          name="map-marker"
          size={20}
          color="#ffffff"
          />
        } 
        buttonStyle={{backgroundColor: "#eb4d4b"}}
        type="solid"
        onPress={()=>setAddPOI(true)} />
      </View>
  );
}

function mapStateToProps(state) {
  return { pseudo : state.pseudo }
}

export default connect(
  mapStateToProps, 
  null
)(MapScreen);
