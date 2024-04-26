'use client'
import { DeviceSettings, VideoPreview, useCall } from '@stream-io/video-react-sdk'
import React, { useEffect, useState } from 'react'
import { Button } from './ui/button';

//for camera and microphone setup
const MeetingSetup = ({setIsSetupComplete}:{setIsSetupComplete: (value:boolean)=>void}) => {

  const[isMicCamToggledOn,setIsMicCamToggledOn]=useState(true);

  const call=useCall();

  if(!call){
    throw new Error("usecall must be used within streamcall component");
  }

  useEffect(() => {
    if (isMicCamToggledOn) {
      call.camera.disable();
      call.microphone.disable();
    } else {
      call.camera.enable();
      call.microphone.enable();
    }
  }, [isMicCamToggledOn])
  

  return (
    <div className='flex h-screen w-full flex-col items-center justify-center gap-3 text-white'>

      <h1 className="text-2xl font-bold">Setup</h1>

      <div className="flex max-w-[700px]">
      <VideoPreview/>
      </div>

      <div className="flex h-16 items-center justify-center gap-3">
        <label htmlFor="" className="flex items-center justify-center gap-2 font-medium">
          <input type="checkbox" name="" id=""  
          checked={isMicCamToggledOn}
          onChange={(e)=>setIsMicCamToggledOn(e.target.checked)} />

          Join with mic and camera off
        </label>

        <DeviceSettings  />

      </div>
      <Button className='rounded-md bg-green-500 pz-4 py-3' onClick={()=>{
        call.join();

        setIsSetupComplete(true);
      }}>
          Join Meeting
      </Button>




    </div>
  )
}

export default MeetingSetup
