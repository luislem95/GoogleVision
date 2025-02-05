<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>OCR con Google Cloud Vision</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-button @click="seleccionarFuente">Seleccionar Imagen</ion-button>

      <div v-if="imagen" class="imagen-container">
        <img :src="imagen" alt="Imagen capturada" />
      </div>

      <ion-button v-if="imagen" @click="procesarTexto">Extraer Texto</ion-button>
      <p v-if="textoExtraido" class="texto-extraido">{{ textoExtraido }}</p>
    </ion-content>
  </ion-page>
</template>

<script>
import { defineComponent, ref } from "vue";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import axios from "axios";
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, alertController, actionSheetController } from "@ionic/vue";

export default defineComponent({
  components: {
    IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton
  },
  setup() {
    const imagen = ref(null);
    const textoExtraido = ref("");

    // Selección de imagen (cámara o galería)
    const seleccionarFuente = async () => {
      const actionSheet = await actionSheetController.create({
        header: "Selecciona una opción",
        buttons: [
          { text: "Tomar Foto", handler: () => tomarFoto(CameraSource.Camera) },
          { text: "Seleccionar de la Galería", handler: () => tomarFoto(CameraSource.Photos) },
          { text: "Cancelar", role: "cancel" },
        ],
      });
      await actionSheet.present();
    };

    // Captura de imagen
    const tomarFoto = async (source) => {
      try {
        const photo = await Camera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.Base64,
          source: source,
        });
        imagen.value = `data:image/jpeg;base64,${photo.base64String}`;
      } catch (error) {
        mostrarAlerta("Error", "No se pudo obtener la imagen.");
      }
    };

    // Procesar imagen con Google Cloud Vision y extraer número de 11 dígitos
    const procesarTexto = async () => {
      if (!imagen.value) return;

      const apiKey = "<apikey aqui>"; // Reemplázala con tu clave de Google Cloud Vision

      const requestData = {
        requests: [
          {
            image: { content: imagen.value.split(",")[1] },
            features: [{ type: "TEXT_DETECTION" }],
          },
        ],
      };

      try {
        const response = await axios.post(
          `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
          requestData
        );

        const textoDetectado = response.data.responses[0].fullTextAnnotation?.text || "";
        
        // 🔥 Filtrar solo el primer número de 11 dígitos encontrado
        const numeros = textoDetectado.match(/\b\d{11}\b/g); 
        textoExtraido.value = numeros ? numeros[0] : "No se detectó un número de 11 dígitos.";

      } catch (error) {
        console.error("Error en la API de Google Vision:", error);
        mostrarAlerta("Error", "No se pudo procesar la imagen.");
      }
    };

    // Mostrar alerta en Ionic
    const mostrarAlerta = async (titulo, mensaje) => {
      const alert = await alertController.create({
        header: titulo,
        message: mensaje,
        buttons: ["OK"],
      });
      await alert.present();
    };

    return { imagen, seleccionarFuente, procesarTexto, textoExtraido };
  },
});
</script>

<style scoped>
/* Ajuste para centrar la imagen y los botones */
.imagen-container {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

img {
  max-width: 150px;
  height: auto;
  border-radius: 10px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.2);
}

.texto-extraido {
  margin-top: 15px;
  background: #636363;
  padding: 10px;
  border-radius: 5px;
  word-wrap: break-word;
  font-size: 18px;
  font-weight: bold;
  text-align: center;
}
</style>
