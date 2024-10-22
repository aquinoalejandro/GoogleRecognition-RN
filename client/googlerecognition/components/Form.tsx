import React, { useState } from 'react';
import { View, Button, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';


export function Form() {
    const [imageSelected, setImageSelected] = useState<string | null>(null);

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

    function cleanImage() {
        setImageSelected(null);
    }

    return (
        <View>
            <Button title="Take Picture" onPress={takePicture} />
            {imageSelected && (
                <View style={{ alignItems: 'center' }}>
                <Image source={{ uri: imageSelected }} style={{ width: 200, height: 200 }} />
                </View>
            )}

            <Button title="Clean Image" onPress={cleanImage} />

        </View>
    );
}
