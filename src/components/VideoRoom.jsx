import React, { useEffect, useState } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { VideoPlayer } from './VideoPlayer';


const APP_ID= 'af44d775ff5843ab89f8906843eef333';
const TOKEN = '007eJxTYJi7jaGJ99SVGqWzIqKn8m4sy7L326pcNPNjSe7qL4zhh7kVGBLTTExSzM1N09JMLUyME5MsLNMsLA3MgOzU1DRjY+P/EiapDYGMDL8/2jIzMkAgiM/MUJ6SxcAAABWFHvc=';
const CHANNEL = 'wdj';

const client = AgoraRTC.createClient({
    mode: 'rtc',
    codec: 'vp8',
});

export const VideoRoom = () => {
  const [users, setUsers] = useState([]);
  const [localTracks, setLocalTracks] = useState([]);

  const handleUserJoined = async (user, mediaType) => {
    await client.subscribe(user, mediaType);

    if (mediaType === 'video'){
        setUsers((previousUsers) => [...previousUsers, user]);
    }

    if (mediaType === 'audio'){
        // user.audioTrack.play()
    }
  };
   const handleUserleft = (user) => {
    setUsers((previousUsers) =>
      previousUsers.filter((u) => u.uid !== user.uid)
    );
   };

  useEffect(() =>{
    client.on('user-published', handleUserJoined);
    client.on('user-left', handleUserleft);

    client
        .join(APP_ID, CHANNEL, TOKEN, null)
        .then((uid) => 
        Promise.all([AgoraRTC.createMicrophoneAndCameraTracks(), uid])
        ).then(([tracks, uid]) => {
            const [audioTrack, videoTrack] = tracks;
            setLocalTracks(tracks);
            setUsers((previousUsers)=> [
                ...previousUsers,
                {
                uid,
                videoTrack,
                audioTrack,
            },
        ]);
            client.publish(tracks);
        });

        return () => {
            for (let localTrack of localTracks){
              localTrack.stop();
              localTrack.close();
            }
        client.off('user-published', handleUserJoined);
        client.off('user-left', handleUserleft);  
        client.unpublish(tracks).then(() => client.leave());
        };

  }, []);

  return (
    <div style= {{display: 'flex', justifyContent: 'center'}}
    >
        <div style = {{
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 200px)'
            }}
        >

        
        {users.map((user) => (
            <VideoPlayer key={user.uid} user = {user} />
        ))}
        </div>
    </div>
  )
}
