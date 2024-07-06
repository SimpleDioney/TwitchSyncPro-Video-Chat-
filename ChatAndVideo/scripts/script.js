document.addEventListener("DOMContentLoaded", function() {
    const chatContainer = document.getElementById('chat');
    const channelInput = document.getElementById('channel-input');
    const connectButton = document.getElementById('connect-button');
    const statusElement = document.getElementById('status');
    const messageCountElement = document.getElementById('message-count');
    const userCountElement = document.getElementById('user-count');
    const chatLoginButton = document.getElementById('chat-login-button');
    const loginModal = document.getElementById('login-modal');
    const closeModal = document.getElementsByClassName('close')[0];
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username');
    const oauthInput = document.getElementById('oauth');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');

    let client;
    let messageCount = 0;
    let userSet = new Set();
    let isAuthenticated = false;
    let currentChannel = null;
    let twitchEmbed;

    chatLoginButton.onclick = function() {
      loginModal.style.display = "block";
    }

    closeModal.onclick = function() {
      loginModal.style.display = "none";
    }

    window.onclick = function(event) {
      if (event.target == loginModal) {
        loginModal.style.display = "none";
      }
    }

    loginForm.onsubmit = function(e) {
      e.preventDefault();
      const username = usernameInput.value.trim();
      const oauth = oauthInput.value.trim();

      if (username && oauth) {
        authenticate(username, oauth);
      } else {
        alert('Please enter both username and OAuth token.');
      }
    }

    function authenticate(username, oauth) {
      if (client) {
        client.disconnect();
        client.removeAllListeners('message');
      }

      const opts = {
        options: { debug: true },
        connection: {
          secure: true,
          reconnect: true
        },
        identity: {
          username: username,
          password: oauth.startsWith('oauth:') ? oauth : `oauth:${oauth}`
        },
        channels: []
      };

      client = new tmi.Client(opts);

      client.on('connected', (addr, port) => {
        console.log(`Connected as ${username}`);
        statusElement.textContent = `Connected as ${username}`;
        statusElement.style.backgroundColor = 'var(--success-color)';
        chatContainer.innerHTML = `<div class="message"><span class="user">System:</span><span class="text">Connected as ${username}. Join a channel to start chatting.</span></div>`;
        
        messageCount = 0;
        userSet.clear();
        updateStats();

        messageInput.disabled = false;
        sendButton.disabled = false;
        chatLoginButton.style.display = 'none';
        
        if (currentChannel) {
          client.join(currentChannel).then(() => {
            statusElement.textContent = `Connected to ${currentChannel}'s chat as ${username}`;
          }).catch(error => {
            console.error(`Error joining channel ${currentChannel}:`, error);
            statusElement.textContent = `Failed to join channel ${currentChannel}: ${error.message}`;
            statusElement.style.backgroundColor = 'var(--error-color)';
          });
        }
      });

      client.on('message', (channel, tags, message, self) => {
        if (self) return;

        const chatMessage = {
          user: tags['display-name'],
          message: message,
          timestamp: new Date().toISOString()
        };

        displayMessage(chatMessage);
        
        messageCount++;
        userSet.add(tags['user-id']);
        updateStats();
      });

      client.connect().catch(error => {
        console.error('Connection error:', error);
        statusElement.textContent = `Failed to connect: ${error.message}`;
        statusElement.style.backgroundColor = 'var(--error-color)';
      });

      isAuthenticated = true;
      loginModal.style.display = 'none';
    }

    function displayMessage(chatMessage) {
      const messageElement = document.createElement('div');
      messageElement.classList.add('message');

      const userElement = document.createElement('span');
      userElement.classList.add('user');
      userElement.textContent = chatMessage.user;

      const timestampElement = document.createElement('span');
      timestampElement.classList.add('timestamp');
      timestampElement.textContent = `${new Date(chatMessage.timestamp).toLocaleTimeString()}`;

      const messageTextElement = document.createElement('span');
      messageTextElement.classList.add('text');
      messageTextElement.textContent = chatMessage.message;

      messageElement.appendChild(userElement);
      messageElement.appendChild(timestampElement);
      messageElement.appendChild(messageTextElement);

      chatContainer.appendChild(messageElement);

      while (chatContainer.children.length > 100) {
        chatContainer.removeChild(chatContainer.firstChild);
      }

      chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    function updateStats() {
      messageCountElement.textContent = messageCount;
      userCountElement.textContent = userSet.size;
    }

    function connectToChannel(channel) {
      if (!client) {
        client = new tmi.Client({
          connection: {
            secure: true,
            reconnect: true
          },
          channels: [channel]
        });

        client.on('message', (channel, tags, message, self) => {
          if (self) return;

          const chatMessage = {
            user: tags['display-name'],
            message: message,
            timestamp: new Date().toISOString()
          };

          displayMessage(chatMessage);
          
          messageCount++;
          userSet.add(tags['user-id']);
          updateStats();
        });
      } else {
        client.removeAllListeners('message');

        client.on('message', (channel, tags, message, self) => {
          if (self) return;

          const chatMessage = {
            user: tags['display-name'],
            message: message,
            timestamp: new Date().toISOString()
          };

          displayMessage(chatMessage);
          
          messageCount++;
          userSet.add(tags['user-id']);
          updateStats();
        });

        if (!client.getChannels().includes(`#${channel}`)) {
          client.join(channel);
        }
      }

      client.connect().then(() => {
        currentChannel = channel;
        statusElement.textContent = `Connected to ${channel}'s chat${isAuthenticated ? ` as ${client.getUsername()}` : ''}`;
        statusElement.style.backgroundColor = 'var(--success-color)';

        // Load Twitch video player
        if (twitchEmbed) {
          twitchEmbed.setChannel(channel);
        } else {
          twitchEmbed = new Twitch.Embed("twitch-embed", {
            width: "100%",
            height: "100%",
            channel: channel,
            layout: "video"
          });
        }
      }).catch(error => {
        console.error(`Error connecting to channel ${channel}:`, error);
        statusElement.textContent = `Failed to connect to channel ${channel}: ${error.message}`;
        statusElement.style.backgroundColor = 'var(--error-color)';
      });
    }

    connectButton.addEventListener('click', () => {
      const channel = channelInput.value.trim();
      if (channel) {
        connectToChannel(channel);
      } else {
        alert('Please enter a channel name.');
      }
    });

    sendButton.addEventListener('click', () => {
      const message = messageInput.value.trim();

      if (message && isAuthenticated && currentChannel) {
        client.say(currentChannel, message).then(() => {
          displayMessage({
            user: client.getUsername(),
            message: message,
            timestamp: new Date().toISOString()
          });
          messageInput.value = '';
        }).catch(error => {
          console.error('Error sending message:', error);
          alert(`Failed to send message: ${error.message}`);
        });
      } else if (!isAuthenticated) {
        alert('Please log in to send messages.');
        loginModal.style.display = "block";
      } else {
        alert('Please enter a message and make sure you\'re connected to a channel.');
      }
    });

    messageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        sendButton.click();
      }
    });

    channelInput.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        connectButton.click();
      }
    });

    // Adjust layout on window resize
    window.addEventListener('resize', function() {
      if (twitchEmbed) {
        twitchEmbed.setWidth(document.getElementById('video-container').offsetWidth);
        twitchEmbed.setHeight(document.getElementById('video-container').offsetHeight);
      }
    });
  });