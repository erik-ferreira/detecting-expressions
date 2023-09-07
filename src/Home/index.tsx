import { useEffect, useState } from "react"
import * as FaceDetector from "expo-face-detector"
import { View, Button, ImageSourcePropType } from "react-native"
import { Camera, CameraType, FaceDetectionResult } from "expo-camera"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from "react-native-reanimated"

import neutralImg from "../assets/neutral.png"
import smilingImg from "../assets/smiling.png"
import winkingImg from "../assets/winking.png"

import { styles } from "./styles"

export function Home() {
  const [faceDetected, setFaceDetected] = useState(false)
  const [emoji, setEmoji] = useState<ImageSourcePropType>(neutralImg)
  const [permission, requestCameraPermission] = Camera.useCameraPermissions()

  const faceValues = useSharedValue({
    width: 0,
    height: 0,
    x: 0,
    y: 0,
  })

  const animatedStyle = useAnimatedStyle(() => ({
    position: "absolute",
    zIndex: 1,
    width: faceValues.value.width,
    height: faceValues.value.height,
    transform: [
      { translateX: faceValues.value.x },
      { translateY: faceValues.value.y },
    ],
  }))

  function handleFacesDetected({ faces }: FaceDetectionResult) {
    const face = faces[0] as any

    if (face) {
      const { size, origin } = face.bounds

      faceValues.value = {
        width: size.width,
        height: size.height,
        x: origin.x,
        y: origin.y,
      }

      setFaceDetected(true)

      if (face.smilingProbability > 0.5) {
        setEmoji(smilingImg)
      } else if (
        face.leftEyeOpenProbability > 0.5 &&
        face.rightEyeOpenProbability < 0.5
      ) {
        setEmoji(winkingImg)
      } else {
        setEmoji(neutralImg)
      }
    } else {
      setFaceDetected(false)
    }
  }

  useEffect(() => {
    requestCameraPermission()
  }, [])

  return !permission?.granted ? (
    <View style={styles.containerNotPermission}>
      <Button
        title="Tentar novamente"
        onPress={() => requestCameraPermission()}
      />
    </View>
  ) : (
    <View style={styles.container}>
      {faceDetected && <Animated.Image source={emoji} style={animatedStyle} />}
      <Camera
        style={styles.camera}
        type={CameraType.front}
        onFacesDetected={handleFacesDetected}
        faceDetectorSettings={{
          mode: FaceDetector.FaceDetectorMode.fast,
          detectLandmarks: FaceDetector.FaceDetectorLandmarks.all,
          runClassifications: FaceDetector.FaceDetectorClassifications.all,
          minDetectionInterval: 100,
          tracking: true,
        }}
      />
    </View>
  )
}
