import React, { useState, useEffect } from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
  messagesState,
  newMessagesState,
  refetchMessagesState,
  atomChannelState,
  actualChannelState,
} from '../atom.js';
import MessageList from './MessageList';
import MessageSub from './MessageSub';
import { Message } from '../interfaces/message/message.interface';
import { useParams } from 'react-router';
import { GET_MESSAGES } from '../data/queries';

interface ChatProps {
  username: string;
  user_id: string;
}

const Chat: React.FC<ChatProps> = ({ username, user_id }) => {
  const channelState = useRecoilValue<any>(atomChannelState);
  const [actualChannel, setActualChannel] = useRecoilState<any>(
    actualChannelState,
  );
  const [refetchState, setRefetch] = useRecoilState<any>(refetchMessagesState);
  const [bottom, setBottom] = useState<any>();
  const [messages, setMessages] = useRecoilState<any>(messagesState);
  const [newMessages, setNewMessages] = useRecoilState<any>(newMessagesState);

  let { channel } = useParams();

  useEffect(() => {
    console.log('component Chat did mount');

    setMessages([]);
    setNewMessages([]);
    setActualChannel(channel);

    return function cleanup() {
      console.log('component Chat did unmount');
      setRefetch(null);
    };
  }, []);

  console.log('channelState', channelState);

  if (channelState) {
    const chanObj = channelState.filter((c: any) => c.name === channel);
    console.log('chanObj', chanObj);
  }

  // get appropriate query variables
  const getLastReceivedVars = () => {
    if (newMessages.length === 0) {
      if (messages.length !== 0) {
        return {
          last_received_id: messages[messages.length - 1].id,
          last_received_ts: messages[messages.length - 1].timestamp,
          channel,
        };
      } else {
        return {
          last_received_id: -1,
          last_received_ts: '2018-08-21T19:58:46.987552+00:00',
          channel,
        };
      }
    } else {
      return {
        last_received_id: newMessages[newMessages.length - 1].id,
        last_received_ts: newMessages[newMessages.length - 1].timestamp,
        channel,
      };
    }
  };
  // add new (unread) messages to state
  const addNewMessages = (messages: Message[]) => {
    const newMessagesArr = [...newMessages];
    messages.forEach((m) => {
      // do not add new messages from self
      if (m.user !== user_id) {
        newMessagesArr.push(m);
      }
    });
    setNewMessages(newMessagesArr);
  };

  // add old (read) messages to state
  const addOldMessages = (msgs: Message[]) => {
    const oldMessages = [...messages, ...msgs];
    setMessages(oldMessages);
    setNewMessages([]);
  };

  const refetchData = async () => {
    if (refetchState) {
      const resp = await refetchState(getLastReceivedVars());

      if (
        resp.data.channel &&
        resp.data.channel[0] &&
        resp.data.channel[0].messages.length !== 0
      ) {
        console.log('resp.data', resp.data);
        if (!isViewScrollable()) {
          console.log('is not scrollable');
          addOldMessages(resp.data.channel[0].messages);
        } else {
          if (bottom) {
            console.log('this.state.bottom');
            addOldMessages(resp.data.channel[0].messages);
          } else {
            console.log('!this.state.bottom');
            addNewMessages(resp.data.channel[0].messages);
          }
        }
      }
    }
  };

  // check if the view is scrollable
  const isViewScrollable = () => {
    const isInViewport = (elem: any) => {
      const bounding = elem.getBoundingClientRect();
      return (
        bounding.top >= 0 &&
        bounding.left >= 0 &&
        bounding.bottom <=
          (window.innerHeight || document.documentElement.clientHeight) &&
        bounding.right <=
          (window.innerWidth || document.documentElement.clientWidth)
      );
    };
    if (document.getElementById('lastMessage')) {
      return !isInViewport(document.getElementById('lastMessage'));
    }
    return false;
  };

  return (
    <React.Fragment>
      <Query
        query={GET_MESSAGES}
        variables={getLastReceivedVars()}
        fetchPolicy="network-only"
      >
        {({
          data,
          loading,
          subscribeToMore,
          refetch,
        }: {
          data: any;
          loading: any;
          subscribeToMore: any;
          refetch: any;
        }) => {
          if (!data) {
            return null;
          }

          if (loading) {
            return null;
          }

          console.log('Query received Messages', data);
          console.log('Query received Messages', getLastReceivedVars());

          // load all messages to state in the beginning
          if (
            data.channel &&
            data.channel[0] &&
            data.channel[0].messages.length !== 0
          ) {
            if (messages.length === 0) {
              console.log('add old stuff');
              addOldMessages(data.channel[0].messages);
            }
          }

          if (!refetchState) {
            setRefetch(() => refetch);
          }

          return (
            <MessageSub
              subscribeToMore={subscribeToMore}
              refetchData={refetchData}
            ></MessageSub>
          );
        }}
      </Query>
      <MessageList messages={messages} />
    </React.Fragment>
  );
};

export default Chat;
