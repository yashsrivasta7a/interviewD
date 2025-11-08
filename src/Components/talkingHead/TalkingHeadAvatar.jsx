import { useEffect, useRef } from 'react';

const TalkingHeadAvatar = () => {
  const containerRef = useRef(null);
  const headRef = useRef(null);

  useEffect(() => {
    let head = null;

    const initAvatar = async () => {
      try {
        // Dynamically import the TalkingHead module
        const { TalkingHead } = await import('../../../TalkingHead/modules/talkinghead.mjs');

        // Create a new TalkingHead instance
        head = new TalkingHead(containerRef.current, {
          ttsEndpoint: null, // We'll handle TTS separately
          cameraView: "upper body",
          cameraDistance: 1,
          cameraY: 1.5,
          avatarMood: "neutral",
        });

        headRef.current = head;

        // Load the Ready Player Me avatar
        await head.showAvatar({
          url: 'https://models.readyplayer.me/690f0da265090e7af9d961bb.glb',
          body: 'M',
          avatarMood: 'neutral',
          ttsLang: "en-US",
          ttsVoice: "en-US-JennyNeural",
          lipsyncLang: 'en'
        });

        console.log('TalkingHead avatar loaded successfully!');

        // Optional: Add some idle animations
        head.setMood('neutral');
        
      } catch (error) {
        console.error('Error initializing TalkingHead avatar:', error);
      }
    };

    initAvatar();

    // Cleanup
    return () => {
      if (headRef.current) {
        // Clean up the TalkingHead instance if needed
        headRef.current = null;
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      style={{ 
        width: '100%', 
        height: '100vh',
        position: 'relative',
        background: '#1a1a1a'
      }}
    />
  );
};

export default TalkingHeadAvatar;
