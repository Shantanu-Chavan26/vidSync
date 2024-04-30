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
import { Users, LayoutList, PencilLine, MessageCircleMore } from 'lucide-react';

import {Chat, Channel,ChannelHeader, MessageInput, MessageList, Thread, Window } from 'stream-chat-react';

import { Excalidraw } from "@excalidraw/excalidraw";


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
// import {Channel as StreamChannel, DefaultGenerics, StreamChat } from 'stream-chat';

import 'stream-chat-react/dist/css/v2/index.css';
import './layout.css';
import './excalidrawpage.css';

type CallLayoutType = 'grid' | 'speaker-left' | 'speaker-right';

const MeetingRoom = () => {

  const { user } = useUser();


  const searchParams = useSearchParams();
  const isPersonalRoom = !!searchParams?.get('personal');

  const url = window.location.href; 

  let meetingId:string;
  if (url.includes('?personal=true')) {
    // Personal meeting URL format
    const parts = url.split('/');
    meetingId = parts[parts.length - 2]; // Extract ID before "?personal=true"
  } 
  else {
    const parts = url.split('/');
    meetingId = parts[parts.length - 1]; // Extract ID after "meeting/"
  }

  const router = useRouter();
  const [layout, setLayout] = useState<CallLayoutType>('speaker-left');
  const [showParticipants, setShowParticipants] = useState(false);

  const { useCallCallingState,
    useParticipants} = useCallStateHooks();

  const allParticipants=useParticipants();


  const callingState = useCallCallingState();
  // const [channel, setChannel] = useState<StreamChannel>();
  const [channel, setChannel] = useState();


  // const [client, setClient] = useState<StreamChat<DefaultGenerics> | null>(null);
  const [client, setClient] = useState(null);

  const { StreamChat } = require('stream-chat');

    // chat feature
    // const jwt_token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoidXNlcl8yZkVuazRQbng2Q1lENmd2bXFIYnEzdzBGRG0ifQ.Vhc0rIQ5OzhIABRmv2kPymEeufdgOAAhuurw48NyjHI";

    const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY|| '';
    const userId = user?.id||'';
    const userName = user?.fullName||'';
    const userImg=user?.imageUrl; 
    // let usertoken:string='';


    // chat visibility
    const[showChats,setShowChats]=useState(false);
    const[showWhiteboard,setShowWhiteboard]=useState(false);

    const toggleChats=()=>{
      if(!showChats){
        setShowChats(true);
      }
      else{
        setShowChats(false);
      }
    }

    // excalidraw window

    const toggleWhiteboard=()=>{
      if(!showWhiteboard){
        setShowWhiteboard(true);
      }
      else{
        setShowWhiteboard(false);
      }
    }




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

  

  const createChannel = async () => {
    
    const chatClient=new StreamChat.getInstance(apiKey);

    await chatClient.connectUser({ id: userId, name:userName ,image:userImg }, chatClient.devToken(userId));

    const participantPromises = allParticipants.map(async (participant) => participant.userId); 
    const participantUserIds = await Promise.all(participantPromises); // Wait for all IDs to resolve
    console.log("participants ids-> ",participantUserIds);

    const members = participantUserIds.map(String); 

    console.log("members id-> ",members);

    // const messageRole = await chatClient.createRole({
    //   name: 'chatMember',
    //   permissions: ['ReadChannel', 'SendMessage'],
    // });

    // const roles = members.map(() => messageRole); // Array of custom roles

    try {
      // if(userId!='user_2fEnk4Pnx6CYD6gvmqHbq3w0FDm'){
      //   const response = await checkChannelExists(meetingId);
      //   console.log("other user channel-> ",channel);
      //   setClient(chatClient);
      //   return;
      // }

      console.log("helloooo");

        const newchannel = await chatClient.channel('messaging', meetingId, {
        image: 'https://getstream.io/random_png/?name=vidsync',
        name: 'Lets talk',
        role:"users",
        members
      });

     setChannel(newchannel);
     setClient(chatClient);



      console.log("new channel-> ",newchannel);


      // if(userId==='user_2fEnk4Pnx6CYD6gvmqHbq3w0FDm'){
      //   return;
      //   // user_2f6SAR3vzgkKLIuLredw3cOngBn
      // }

      await newchannel.addMembers(members,{role: "users"});

      // await newchannel.addMembers(members);
      setChannel(newchannel);

      // await newchannel.watch();

      

     
    } catch (error) {
      console.error('Error creating channel:', error);
    }
    
  };


  useEffect(()=>{
    async function init(){
     
      await createChannel(); 

    }
    init();

  },[allParticipants.length,user]);

  


  if (callingState !== CallingState.JOINED || !user) return <Loader />;

  // console.log("user-> ",user);
  // console.log("metting id: ",meetingId);
  // console.log("joined users-> ",allParticipants);
  // console.log("channel-> ",channel)

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

          {/* chat  */}
        <div
          className={cn('h-[calc(100vh-150px)] hidden ml-2', {
            'show-block': showChats,
          })}
        >
          {showChats && client && channel && (
            <Chat client={client!} theme='messaging '>
            <Channel channel={channel}>
              <Window>
                <ChannelHeader />
                <MessageList />
                <MessageInput focus />
              </Window>
              <Thread />
            </Channel>
          </Chat>
          )
          } 
          
        </div>

        <div
          className={cn('h-[calc(100vh-86px)] hidden ml-2', {
            'show-block': showWhiteboard,
          })}
          style={{ width: '100vw', zIndex: 10 }} 
        >
           {showWhiteboard && (
          <>
          <h1 style={{ textAlign: "center" }}>Excalidraw</h1>
          <div style={{ height: "500px" }}>
            <Excalidraw />
          </div>
          </>   
        )}
          
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


         {/* chat btn     */}
         <button onClick={() =>toggleChats()}>
          <div className=" cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]  ">
          <MessageCircleMore/>
          </div>
        </button> 

        <button onClick={() =>toggleWhiteboard()}>
          <div className=" cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]  ">
          <PencilLine/>
          </div>
        </button> 
         

          {/* whiteboard btn  */}
         {/* <div className={isFullscreen ? 'fullscreen' : ''}>
        <button onClick={isFullscreen ? exitFullscreen : toggleFullscreen}>
          <div className=" cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]">
            <PencilLine/>
          </div>
        </button>
       
      </div>      */}
        
        {!isPersonalRoom && <EndCallButton />}

        {/* <Chat client={client!}>Chat with client is ready!</Chat> */}

        {/* {client && channel && (
          <Chat client={client!} theme='messaging '>
          <Channel channel={channel}>
            <Window>
              <ChannelHeader />
              <MessageList />
              <MessageInput focus />
            </Window>
            <Thread />
          </Channel>
        </Chat>
        )}     */}
        
{/* 
        <Chat client={client!}>
          <ChannelList filters={filters} options={options} showChannelSearch sort={sort}  />

          <Channel channel={channel}>
            <Window>
              <ChannelHeader />
              <MessageList />
              <MessageInput />
            </Window>
            <Thread />
          </Channel>
        </Chat> */}
      
        
      </div>
    </section>
  );
};

export default MeetingRoom;
