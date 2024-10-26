import React, { useState } from 'react';
import { View, Button, Image, Text } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { StyleSheet } from 'react-native';
import Axios from 'axios';

const myIp = "192.168.100.9";
export function Form() {
    const [imageSelected, setImageSelected] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [responseGpt, setResponseGpt] = useState("");

    // Pedir permisos para usar la cámara
    const requestCameraPermission = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            alert('Se necesita permiso para acceder a la cámara');
            return false;
        }
        return true;
    };

    // Función para tomar una foto
    const takePicture = async () => {
        const hasPermission = await requestCameraPermission();
        if (!hasPermission) return;

        let result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
            base64: true,
            exif: true,
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: false
        });

        if (!result.canceled) {
            setImageSelected(result.assets[0].uri);
        }
    };

    const uploadImage = async () => {
        if (!imageSelected) {
            alert("No se ha seleccionado ninguna imagen");
            return;
        }

        // Crear un objeto FormData y añadir la imagen seleccionada
        const formData: FormData | any = new FormData();
        formData.append('image', {
            uri: imageSelected,
            name: 'image.jpg',
            type: 'image/jpeg'
        });

        try {
            setIsLoading(true);
            const response = await Axios.post(`http://${myIp}:3000/uploadLens`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            alert('Imagen subida exitosamente');
            setIsLoading(false);

            // Usa JSON.stringify para convertir la respuesta en una cadena legible si es un objeto
            setResponseGpt(typeof response.data === 'object' 
                ? JSON.stringify(response.data.data, null, 2)  // Convierte a JSON string con indentación
                : String(response.data.data)
            );
        } catch (error: any) {
            setIsLoading(false);    
            const errorMessage = error.response?.data || error.message || 'Error desconocido';
            setResponseGpt('Error al subir la imagen: ' + errorMessage);
            alert('Error al subir la imagen: ' + errorMessage);
        }
    };

    const cleanImage = () => {
        setImageSelected(null);
    };

    return (
        <View>
            <View style={styles.botones}>
                <Button title="Take Picture" onPress={takePicture} />
                <Button title="Clean Image" onPress={cleanImage} />
            </View>
            {imageSelected && (
                <View style={{ alignItems: 'center' }}>
                    <Image source={{ uri: imageSelected }} style={{ width: 200, height: 200 }} />
                </View>
            )}
            { isLoading && <Text style={ styles.textoResponse }>Loading...</Text> }
            { !isLoading && <Button title="Upload Image" onPress={uploadImage} />} 
            {  !isLoading && <Text style={ styles.textoResponse }>{responseGpt}</Text> }
        </View>
    );
}

const styles = StyleSheet.create({
    botones: {
        justifyContent: 'space-between',
        flexDirection: 'row',   
    },

    textoResponse: { 
        textAlign: 'center',
        fontSize: 20,
        margin: 10,
        color: 'white'
    }
});
