import React, {useState, useEffect} from 'react';
import { View } from 'react-native';
import {Button, Overlay, Input} from 'react-native-elements'
import Icon from 'react-native-vector-icons/FontAwesome';

import MapView,{Marker} from 'react-native-maps';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';

export default function MapScreen() {

  const [currentLatitude, setCurrentLatitude] = useState(0);
  const [currentLongitude, setCurrentLongitude] = useState(0);
  const [addPOI, setAddPOI] = useState(false);
  const [listPOI, setListPOI] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  
  const [titrePOI, setTitrePOI] = useState();
  const [descPOI, setDescPOI] = useState();
  
  const [tempPOI, setTempPOI] = useState();

  useEffect(() => {
    async function askPermissions() {
      let { status } = await Permissions.askAsync(Permissions.LOCATION);
      if (status === 'granted') {
        Location.watchPositionAsync({distanceInterval: 2},
          (location) => {
             setCurrentLatitude(location.coords.latitude)
             setCurrentLongitude(location.coords.longitude);
          }
        );
      }
    }
    askPermissions();
  }, []);

  var selectPOI = (e) => {
    if(addPOI){
      setAddPOI(false);
      setIsVisible(true);
      setTempPOI({ latitude: e.nativeEvent.coordinate.latitude, longitude:e.nativeEvent.coordinate.longitude } );
    }
  }

  var handleSubmit = () => {
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
          <Marker key={"currentPos"}
              pinColor="red"  
              title="Hello"
              description="I'am here"
              coordinate={{latitude: currentLatitude, longitude: currentLongitude}}
          />   
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

