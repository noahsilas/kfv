import { useEffect, useMemo, useState } from 'react';
import './App.css';

function KafkaMessage({ event }) {
  const { topic, partition, message } = event;
  const { attributes, batchContext, headers, isControlRecord, key, magicByte, offset, timestamp, value } = message;
  return (
    <div className='kafkaMessage'>
      <div className="partition"><span title={`partition ${partition}`}>{partition}</span></div>
      <b>Key:</b> {key}<br />
      <b>Value:</b> {value}
      <details>
        <summary />
        <pre>
          {JSON.stringify(message, null, 2)}
        </pre>
      </details>
    </div>
  );
}

function App() {
  console.log('render start');
  const [events, setEvents] = useState([]);
  window.allEvents = events;
  useEffect(() => {
    console.log('starting socket');
    const socket = new WebSocket("ws://localhost:8234");
    socket.addEventListener("message", (event) => {
      console.log('Got Event', event);
      setEvents(events => [...events, JSON.parse(event.data)]);
    })
    return function () {
      console.log('closing socket');
      socket.close();
    }
  }, [])

  const topics = useMemo(() => Array.from(new Set(events.map(event => event.topic))), [events]);

  return (
    <div className="layout">
      {topics.map((topic, idx) => <div className="topicName" style={{gridColumn: idx + 1}}>{topic}</div>)}
      {events.map(event => (
        <div style={{gridColumn: topics.indexOf(event.topic) + 1}}>
          <KafkaMessage event={event} />
        </div>
      ))}
    </div>
  );
}

export default App;
