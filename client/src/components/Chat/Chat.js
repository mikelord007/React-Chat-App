import React,{useState,useEffect} from 'react';
import queryString from 'query-string';
import "./Chat.css"
import io from 'socket.io-client';

import  InfoBar from '../InfoBar/InfoBar'
import  Input from '../Input/Input'
import  Messages from '../Messages/Messages'
let socket;

const Chat = ({location}) =>{

    const [name,setName] = useState('');
    const [room, setRoom] = useState('');
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);

    const ENDPOINT = 'localhost:5000'

    useEffect(() => {
        const {room, name} = queryString.parse(location.search);
        setName(name);
        setRoom(room);

        socket = io(ENDPOINT);

        socket.emit('join',{name,room},(error) => {
            window.alert(error)
        })

        return () => {
            socket.emit('disconnect');
            socket.off();
        }
    },[location.search,ENDPOINT]);

    useEffect(() => {
        socket.on('message', (message) => {
            setMessages([...messages,message])
        })

    }, [messages])

    console.log(message,messages);

    const sendMessage = (event) => {
        event.preventDefault();

        if(message) {
            socket.emit('sendMessage', message, () => setMessage(''));
        }
    }

    return (
        <div className="outerContainer">
            <div className="container">
                <InfoBar room={room}/>
                <Messages messages={messages} name={name} />
                <Input message={message} setMessage={setMessage} sendMessage={sendMessage}/>
                {/* <input value={message} onChange={(event) => setMessage(event.target.value)} onKeyPress={event => event.key==='Enter' ? sendMessage(event): null} /> */}

            </div>
        </div>
    )
}


export default Chat;