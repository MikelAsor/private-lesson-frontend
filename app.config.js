export default {
  expo: {
  plugins: [
      "expo-audio",
      "expo-video",
      "react-native-track-player"
    ],
    name: "TaskMate",
    slug: "taskmate",
    version: "1.0.0",
    android: { 
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#FFFFFF"
      },
      package: "com.masore.privateLessons" 
    },
    ios: {
      bundleIdentifier: "com.masore.privateLessons" ,
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false 
      }
    },
    extra: {
      SERVER_URL: "https://private-lessones-2dbg.onrender.com",
      eas: { 
        projectId: "d873cc5d-8ab6-4b5c-b443-2bda40a32b82"
      },
    },
  },
};
