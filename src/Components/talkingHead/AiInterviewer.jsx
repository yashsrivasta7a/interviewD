import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { generateSpeech } from './AzureOpenAI.js';

const AiInterviewer = forwardRef(({ currentQuestion }, ref) => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const avatarRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const isPlayingRef = useRef(false);
  const morphTargetsRef = useRef(null);
  const currentAudioRef = useRef(null);

  // Function to play audio with lip sync
  const playAudioWithLipSync = async (audioUrl) => {
    console.log('playAudioWithLipSync called with:', audioUrl);
    
    if (!morphTargetsRef.current) {
      console.warn('No morph targets found, playing audio without lip sync');
      const audio = new Audio(audioUrl);
      await audio.play();
      return;
    }

    try {
      // Stop any currently playing audio
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }

      // Create audio context if not exists
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 512;
        analyserRef.current.smoothingTimeConstant = 0.3;
      }

      const audioContext = audioContextRef.current;
      const analyser = analyserRef.current;

      // Fetch and decode audio
      const response = await fetch(audioUrl);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      // Create source and connect to analyser
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(analyser);
      analyser.connect(audioContext.destination);

      isPlayingRef.current = true;
      source.start(0);

      console.log('Audio started playing with lip sync');

      // Handle audio end
      source.onended = () => {
        console.log('Audio ended');
        isPlayingRef.current = false;
        resetMouth();
      };
    } catch (error) {
      console.error('Error in playAudioWithLipSync:', error);
      isPlayingRef.current = false;
    }
  };

  // Function to speak text using Azure TTS
  const speakText = async (text) => {
    try {
      console.log('Generating speech for:', text);
      const audioUrl = await generateSpeech(text, 'alloy');
      await playAudioWithLipSync(audioUrl);
    } catch (error) {
      console.error('Error in speakText:', error);
    }
  };

  // Reset mouth to neutral position
  const resetMouth = () => {
    if (!morphTargetsRef.current) return;
    
    const morphTargets = morphTargetsRef.current.morphTargetDictionary;
    const influences = morphTargetsRef.current.morphTargetInfluences;
    
    // Smoothly reset to neutral
    const resetSpeed = 0.1;
    const resetInterval = setInterval(() => {
      let allReset = true;
      Object.keys(morphTargets).forEach(key => {
        if (key.toLowerCase().includes('mouth') || 
            key.toLowerCase().includes('jaw') ||
            key.toLowerCase().includes('lips')) {
          const currentValue = influences[morphTargets[key]];
          if (currentValue > 0.01) {
            influences[morphTargets[key]] = Math.max(0, currentValue - resetSpeed);
            allReset = false;
          } else {
            influences[morphTargets[key]] = 0;
          }
        }
      });
      if (allReset) {
        clearInterval(resetInterval);
      }
    }, 16);
  };

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    speakText: speakText
  }));

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      45,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    // Position camera for face/head view
    camera.position.set(0, 1.64, 0.6);
    camera.lookAt(0, 1.5, 0);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    
    // Style the canvas to ensure it's visible
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    
    containerRef.current.appendChild(renderer.domElement);

    // Add OrbitControls for manual camera control
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 1.7, 0);
    controls.update();

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
    hemisphereLight.position.set(0, 20, 0);
    scene.add(hemisphereLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(2, 3, 2);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
    fillLight.position.set(-2, 2, -2);
    scene.add(fillLight);

    const backLight = new THREE.DirectionalLight(0xffffff, 0.3);
    backLight.position.set(0, 2, -2);
    scene.add(backLight);

    // Load Ready Player Me Avatar
    const loader = new GLTFLoader();
    const avatarUrl = 'https://models.readyplayer.me/690f0da265090e7af9d961bb.glb';

    loader.load(
      avatarUrl,
      (gltf) => {
        const avatar = gltf.scene;
        avatarRef.current = avatar;

        // Add avatar to scene
        scene.add(avatar);

        // Find and store morph targets for lip sync
        avatar.traverse((node) => {
          if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
            if (node.material) {
              node.material.side = THREE.DoubleSide;
            }
            
            // Store reference to head mesh with morph targets
            if (node.morphTargetDictionary && node.morphTargetInfluences) {
              if (node.name.includes('Head') || node.name.includes('Wolf3D_Head')) {
                morphTargetsRef.current = node;
                console.log('Found morph targets:', Object.keys(node.morphTargetDictionary));
                console.log('Morph target indices:', node.morphTargetDictionary);
              }
            }
          }
        });

        console.log('Avatar loaded successfully!');
      },
      undefined,
      (error) => {
        console.error('Error loading avatar:', error);
      }
    );

    // Update mouth morphs based on audio
    const updateLipSync = () => {
      if (!isPlayingRef.current || !analyserRef.current || !morphTargetsRef.current) {
        return;
      }

      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);

      const morphTargets = morphTargetsRef.current.morphTargetDictionary;
      const influences = morphTargetsRef.current.morphTargetInfluences;

      // Calculate overall volume
      const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
      const volume = Math.min(average / 100, 1);

      // Analyze frequency ranges
      const bass = dataArray.slice(0, 32).reduce((a, b) => a + b, 0) / 32 / 150;
      const mid = dataArray.slice(32, 128).reduce((a, b) => a + b, 0) / 96 / 120;
      const high = dataArray.slice(128, 256).reduce((a, b) => a + b, 0) / 128 / 80;

      const smoothing = 0.3;

      const setMorph = (name, value) => {
        if (morphTargets['viseme_' + name] !== undefined) {
          const current = influences[morphTargets['viseme_' + name]] || 0;
          influences[morphTargets['viseme_' + name]] = current + (value - current) * smoothing;
        }
        if (morphTargets[name] !== undefined) {
          const current = influences[morphTargets[name]] || 0;
          influences[morphTargets[name]] = current + (value - current) * smoothing;
        }
      };

      // Basic jaw and mouth opening based on volume
      setMorph('jawOpen', volume * 0.8);
      setMorph('mouthOpen', volume * 0.9);
      
      // Visemes based on frequency content
      if (volume > 0.15) {
        if (bass > 0.5) {
          // Open vowels
          setMorph('aa', 0.8);
          setMorph('O', bass * 0.7);
        } else if (mid > 0.4) {
          // Mid vowels
          setMorph('E', mid * 0.7);
          setMorph('I', mid * 0.6);
        } else if (high > 0.4) {
          // Consonants
          setMorph('SS', high * 0.6);
          setMorph('DD', high * 0.5);
        }
      } else if (volume < 0.1) {
        // Closed mouth
        setMorph('sil', 0.3);
        setMorph('PP', 0.3);
      }

      // Log for debugging (remove after testing)
      if (volume > 0.2 && Math.random() < 0.1) {
        console.log('LipSync - Volume:', volume.toFixed(2), 
                    'Bass:', bass.toFixed(2), 
                    'Mid:', mid.toFixed(2), 
                    'High:', high.toFixed(2));
      }
    };

    // Animation loop
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      updateLipSync();
      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      
      if (controls) {
        controls.dispose();
      }
      
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      
      renderer.dispose();
      
      if (avatarRef.current) {
        scene.remove(avatarRef.current);
      }
    };
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div 
        ref={containerRef} 
        style={{ 
          width: '100%', 
          height: 'calc(100% - 60px)',
          position: 'relative',
          overflow: 'hidden'
        }}
      />
      
      {/* Question Display at Bottom */}
      {currentQuestion && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '12px 16px',
          background: 'linear-gradient(to top, rgba(139, 92, 246, 0.95), rgba(139, 92, 246, 0.85))',
          color: 'white',
          fontSize: '14px',
          fontWeight: '500',
          textAlign: 'center',
          borderTop: '2px solid rgba(255, 255, 255, 0.3)',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ fontSize: '11px', opacity: 0.9, marginBottom: '4px' }}>
            Current Question:
          </div>
          <div style={{ lineHeight: '1.4' }}>
            {currentQuestion}
          </div>
        </div>
      )}
    </div>
  );
});

AiInterviewer.displayName = 'AiInterviewer';

export default AiInterviewer;
