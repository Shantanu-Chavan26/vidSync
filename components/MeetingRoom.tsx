'use client';
import { useEffect, useState } from 'react';
import {
  CallControls,
  CallParticipantsList,
  CallStatsButton,
  CallingState,
  PaginatedGridLayout,
  SpeakerLayout,
  useCallStateHooks,
} from '@stream-io/video-react-sdk';
import { useRouter, useSearchParams } from 'next/navigation';
import { Users, LayoutList } from 'lucide-react';

import { useCreateChatClient, Chat, Channel, ChannelHeader, MessageInput, MessageList, Thread, Window } from 'stream-chat-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import Loader from './Loader';
import EndCallButton from './EndCallButton';
import { cn } from '@/lib/utils';
import Navbar from './Navbar';
import { useUser } from '@clerk/nextjs';
import { User, Channel as StreamChannel } from 'stream-chat';

import 'stream-chat-react/dist/css/v2/index.css';
import './layout.css';

type CallLayoutType = 'grid' | 'speaker-left' | 'speaker-right';

const MeetingRoom = () => {

  const searchParams = useSearchParams();
  const isPersonalRoom = !!searchParams?.get('personal');
  const router = useRouter();
  const [layout, setLayout] = useState<CallLayoutType>('speaker-left');
  const [showParticipants, setShowParticipants] = useState(false);
  const { useCallCallingState } = useCallStateHooks();
  
  const { StreamChat } = require('stream-chat');


  // const [userToken, setUserToken] = useState(null);
  // const [client, setClient] = useState<typeof StreamChat>(); 

  const { user } = useUser();

  const callingState = useCallCallingState();

    //chat feature
  const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY|| '';
  const userId = user?.id||'';
  const userName = user?.fullName||'';
  const userImg=user?.imageUrl;  
  const userToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoidXNlcl8yZkVuazRQbng2Q1lENmd2bXFIYnEzdzBGRG0ifQ.Vhc0rIQ5OzhIABRmv2kPymEeufdgOAAhuurw48NyjHI';

  const [channel, setChannel] = useState<StreamChannel>();

  // const getToken = async () => {
  //       try {
  //         // Make API call to your backend to generate Stream Chat token
  //         const response = await fetch('/api/generateToken', {
  //           method: 'POST',
  //           headers: {
  //             'Content-Type': 'application/json',
  //           },
  //           body: JSON.stringify({ userId }),
  //         });
    
  //         const token = await response.json();
  //         console.log("user token frontend-> ", token);
  //         setUserToken(token);

  //       } catch (error) {
  //         console.error('Error generating user token:', error);
  //       }
  // };

  const client = useCreateChatClient({
      apiKey,
      tokenOrProvider: userToken,
      userData: {
        id: userId,
        name: userName,
        image: userImg,
      },
  });  


  const CallLayout = () => {
    switch (layout) {
      case 'grid':
        return <PaginatedGridLayout />;
      case 'speaker-right':
        return <SpeakerLayout participantsBarPosition="left" />;
      default:
        return <SpeakerLayout participantsBarPosition="right" />;
    }
  };
  
  useEffect(() => {
    if (!client) return;

    const channel = client.channel('messaging','hello' , {
      image: 'https://getstream.io/random_png/?name=vidsync',
      name: 'Lets talk',
      members: [userId],
    });

    setChannel(channel);
  }, [client]);


  if (callingState !== CallingState.JOINED) return <Loader />;

  console.log("user-> ",user);

  return (
    <section className="relative h-screen w-full overflow-hidden pt-4 text-white">
      <Navbar/>
      <div className="relative flex size-full items-center justify-center">
        <div className=" flex size-full max-w-[1000px] items-center">
          <CallLayout />
        </div>
        <div
          className={cn('h-[calc(100vh-86px)] hidden ml-2', {
            'show-block': showParticipants,
          })}
        >
          <CallParticipantsList onClose={() => setShowParticipants(false)} />
        </div>
      </div>
      {/* video layout and call controls */}
      <div className="fixed bottom-0 flex w-full items-center justify-center gap-5">
        <CallControls onLeave={() => router.push(`/`)} />

        <DropdownMenu>
          <div className="flex items-center">
            <DropdownMenuTrigger className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]  ">
              <LayoutList size={20} className="text-white" />
            </DropdownMenuTrigger>
          </div>
          <DropdownMenuContent className="border-dark-1 bg-dark-1 text-white">
            {['Grid', 'Speaker-Left', 'Speaker-Right'].map((item, index) => (
              <div key={index}>
                <DropdownMenuItem
                  onClick={() =>
                    setLayout(item.toLowerCase() as CallLayoutType)
                  }
                >
                  {item}
                </DropdownMenuItem>
                <DropdownMenuSeparator className="border-dark-1" />
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <CallStatsButton />
        <button onClick={() => setShowParticipants((prev) => !prev)}>
          <div className=" cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]  ">
            <Users size={20} className="text-white" />
          </div>
        </button>        
        
        {!isPersonalRoom && <EndCallButton />}

        {/* <Chat client={client!}>Chat with client is ready!</Chat> */}

        {/* {client && channel &&( */}
          <Chat client={client!}>
          <Channel channel={channel}>
            <Window>
              <ChannelHeader />
              <MessageList />
              <MessageInput />
            </Window>
            <Thread />
          </Channel>
        </Chat>
        {/* )} */}
       
        
      </div>
    </section>
  );
};

export default MeetingRoom;
