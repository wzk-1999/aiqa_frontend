<template>
  <div class="flex flex-center">
    <span
      id="typed-output"
      class="typing text-h5 text-weight-bold q-mt-xl"
    ></span>
    <!-- <img
      alt="Quasar logo"
      src="~assets/cas_logo.jpg"
      style="width: 30%; height: 30%"
    /> -->
    <!-- Conditionally display the captcha image if available -->
    <div v-if="captchaImageUrl" class="absolute-center">
      <q-img
        :src="captchaImageUrl"
        alt="Captcha"
        style="height: 4rem; width: 17rem"
        @click="generateCaptcha"
      />

      <p class="text-subtitle1 q-mt-lg">看不清？点击图片切换下一张</p>

      <q-input
        outlined
        v-model="captchaInput"
        placeholder="输入验证码"
        input-class="text-subtitle1"
      >
        <template v-slot:after>
          <q-btn
            color="primary"
            label="提交"
            style="height: 90%"
            @click="submitCaptcha"
        /></template>
      </q-input>
    </div>
    <div
      v-show="captchaImageUrl ? false : true"
      class="q-pr-xl q-pl-md q-py-md"
      style="width: 100%"
    >
      <q-chat-message
        v-for="message in Messages"
        :key="message.message_id"
        :text="[message.content]"
        :sent="message.type === 'user'"
        :avatar="
          message.type === 'assistant' ? './src/assets/cas_logo.jpg' : undefined
        "
        class="text-left"
        :bg-color="message.type === 'assistant' ? 'grey-2' : 'blue-7'"
        :text-color="message.type === 'user' ? 'white' : null"
      >
        <template v-slot:default>
          <!-- Render the processed Markdown content using v-html -->
          <div v-html="renderMarkdown(message.content)"></div>
        </template>
        <template v-slot:stamp>
          <div class="q-pt-sm text-left q-gutter-sm">
            <q-icon
              name="content_copy"
              size="xs"
              @click="() => handleCopy(message.content)"
            >
              <q-tooltip class="text-body2">复制</q-tooltip>
            </q-icon>
            <template v-if="message.type === 'assistant' && message.message_id">
              <q-icon
                :name="message.is_thumb_up ? 'thumb_up' : 'o_thumb_up'"
                size="xs"
                @click="handleLikeToggle(message.message_id)"
              >
                <q-tooltip class="text-body2">点赞</q-tooltip>
              </q-icon>
              <q-icon
                :name="message.is_thumb_down ? 'thumb_down' : 'o_thumb_down'"
                size="xs"
                @click="handleDisLikeToggle(message.message_id)"
              >
                <q-tooltip class="text-body2">没有用</q-tooltip>
              </q-icon>
            </template>
          </div>
        </template>
      </q-chat-message>
    </div>
    <q-footer elevated class="bg-grey-1 q-pr-xl q-pl-md">
      <q-input
        rounded
        outlined
        v-model="userInput"
        :label="
          captchaImageUrl ? '继续使用之前，请完成人机校验' : '请输入您的问题'
        "
        class="q-my-md"
        @keypress.enter="sendSSEPostRequest"
        :readonly="captchaImageUrl ? true : false"
      >
        <q-tooltip
          class="text-subtitle1 text-center"
          style="width: 75%; height: 6%"
          v-if="captchaImageUrl ? true : false"
          >继续使用之前，请完成人机校验</q-tooltip
        >

        <template v-slot:append>
          <q-avatar @click="handleSSEAvatarClick">
            <q-icon
              :name="captchaImageUrl ? 'block' : iconName"
              class="text-h4"
              color="primary"
            >
              <q-tooltip
                class="text-body2"
                v-if="captchaImageUrl ? false : true"
                >{{ tooltipText }}</q-tooltip
              >
            </q-icon>
          </q-avatar>
        </template>
      </q-input>
    </q-footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from "vue";
import Typed from "typed.js";
import axios from "axios";
import { useQuasar } from "quasar";
import { SSE } from "sse.js"; // Import SSE from the library
import MarkdownIt from "markdown-it"; // Import MarkdownIt
import { v4 as uuidv4 } from "uuid"; // Use a library like uuid to generate unique IDs

const $q = useQuasar();
const API_URL = import.meta.env.VITE_API_URL;

const isSending = ref(false);
const iconName = ref("send");
const tooltipText = ref("发送");

// use watch, otherwise the icon can't render immediately
watch(isSending, (newValue) => {
  iconName.value = newValue ? "stop_circle" : "send";
  tooltipText.value = newValue ? "停止生成" : "发送";
});

const Messages = ref([]); // Store messages as an array
const userInput = ref("");
const captchaInput = ref(""); // Store user input for the captcha
const captchaImageUrl = ref(null); // Store the captcha image URL
const md = new MarkdownIt({ html: true, linkify: true });
let currentBotMessageIndex = 0; // Track the current assistant message index for SSE
let sseSource = null;

// Method to process and render markdown content
const renderMarkdown = (content) => {
  return md.render(content); // Convert markdown to HTML
};

const handleCopy = (text) => {
  navigator.clipboard.writeText(text).then(() => {
    $q.notify({
      message: "复制成功",
      type: "positive", // Success message
    });
  });
};

const handleLikeToggle = async (messageId) => {
  const message = Messages.value.find((msg) => msg.message_id === messageId);

  if (message) {
    try {
      // Determine the like status to send to the backend
      const newLikeStatus = !message.is_thumb_up;
      // console.log(message);
      // Send the like/unlike request to the backend
      await axios.post(`${API_URL}api/v1/message/like/`, {
        user_id: message.user_id,
        session_id: message.session_id,
        message_id: message.message_id,
        isLiked: newLikeStatus,
      });

      if (message.is_thumb_up) {
        message.is_thumb_up = false;
        $q.notify({
          message: "已取消点赞",
          type: "info", // info message
          textColor: "black",
        });
      } else {
        message.is_thumb_up = true;
        $q.notify({
          message: "感谢您的认可",
          type: "positive", // success message
        });
      }
      // console.log(message.is_thumb_up);
    } catch (error) {
      $q.notify({
        message: "操作失败，请重试",
        type: "negative", // negative message
      });
    }
  }
};

const handleDisLikeToggle = async (messageId) => {
  const message = Messages.value.find((msg) => msg.message_id === messageId);

  if (message) {
    try {
      // Determine the like status to send to the backend
      const newDislikeStatus = !message.is_thumb_down;

      // Send the like/unlike request to the backend
      await axios.post(`${API_URL}api/v1/message/dislike/`, {
        user_id: message.user_id,
        session_id: message.session_id,
        message_id: message.message_id,
        isDisLiked: newDislikeStatus,
      });

      if (message.is_thumb_down) {
        message.is_thumb_down = false;
        $q.notify({
          message: "已取消反馈",
          type: "info", // info message
          textColor: "black",
        });
      } else {
        message.is_thumb_down = true;
        $q.notify({
          message: "已收到您的反馈",
          type: "positive", // success message
        });
      }
    } catch (error) {
      $q.notify({
        message: "操作失败，请重试",
        type: "negative", // negative message
      });
    }
  }
};

const stopSSERequest = () => {
  // console.log("连接已打开，正在关闭...");
  if (sseSource) {
    sseSource.close();
    sseSource = null; // 可选：将 sseSource 设置为 null 以表示没有活动的连接
  }
  isSending.value = false;
};

const sendSSEPostRequest = () => {
  if (userInput.value.trim()) {
    axios.get(`${API_URL}api/v1/check/captcha/necessity/`).then((response) => {
      if (response.data.captcha_required) {
        generateCaptcha();
        return;
      } else {
        const sessionId = sessionStorage.getItem("session_id");
        const userID = sessionStorage.getItem("user_id");
        const question = userInput.value;
        const message_id = uuidv4();

        // Push the user message with a unique ID
        Messages.value.push({
          message_id: message_id,
          content: userInput.value,
          type: "user",
        });

        userInput.value = ""; // Clear the input after submission

        sseSource = SSE(`${API_URL}api/v1/chat/stream/`, {
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
          payload: JSON.stringify({
            question,
            session_id: sessionId,
            tmp_user_id: userID,
            message_id: message_id,
          }),
        });
        isSending.value = true;
        // Listen for incoming messages
        sseSource.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.message) {
            // Add a new message if it's the first chunk from the bot
            if (currentBotMessageIndex === 0) {
              Messages.value.push({
                type: "assistant",
                content: "",
              });
              currentBotMessageIndex = Messages.value.length - 1; // Save the index of the assistant message
            }
            // Concatenate the incoming chunk to the current assistant message
            Messages.value[currentBotMessageIndex].content += data.message;
          } else if (data.messages_id) {
            isSending.value = false;
            Messages.value[currentBotMessageIndex].message_id =
              data.messages_id;
            currentBotMessageIndex = 0;
          }
        };

        // 监听错误事件（可选）
        sseSource.onerror = (error) => {
          console.error("SSE error:", error);
          sseSource.close(); // 在发生错误时也可以关闭连接
        };
      }
    });
  } else {
    $q.notify({
      message: "您没有输入内容哦",
      type: "warning", // success message
      timeout: 800,
    });
  }
};

const handleSSEAvatarClick = () => {
  if (isSending.value) {
    stopSSERequest();
  } else {
    sendSSEPostRequest();
  }
};

let typedInstance = null;
let sessionId = sessionStorage.getItem("session_id");
let userID = sessionStorage.getItem("user_id");
const finalUserID = userID && userID !== "undefined" ? userID : "";

const generateCaptcha = () => {
  axios
    .get(`${API_URL}api/v1/get_captcha/${finalUserID}`, {
      responseType: "blob", // Important: set responseType to blob to handle the image
    })
    .then((captchaResponse) => {
      const url = URL.createObjectURL(captchaResponse.data);
      captchaImageUrl.value = url; // Save the URL for displaying the image
      // userInput.disabled = true;
    })
    .catch((error) => {
      $q.notify({
        message: error,
        type: "negative",
      });
    });
};

const submitCaptcha = () => {
  axios
    .post(`${API_URL}api/v1/verify_captcha/`, {
      user_id: userID,
      captcha_input: captchaInput.value,
    })
    .then((verifyResponse) => {
      captchaInput.value = "";
      $q.notify({
        message: verifyResponse.data.message,
        type: verifyResponse.data.result ? "positive" : "negative",
      });
      if (verifyResponse.data.result) {
        captchaImageUrl.value = null;
      }
    })
    .catch((error) => {
      $q.notify({
        message: error,
        type: "negative",
      });
    });
};

onMounted(() => {
  const finalSessionId =
    sessionId && sessionId !== "undefined" ? sessionId : "";

  axios
    .get(
      `${API_URL}api/v1/inquiry/?session_id=${finalSessionId}&tmp_user_id=${finalUserID}`
    )
    .then((response) => {
      if (response.data.captcha) {
        generateCaptcha();
      } else if (response.data.messages.length === 0) {
        typedInstance = new Typed("#typed-output", {
          strings: ["你好, ^300 这里是中国科学院邮件系统帮助中心"],
          typeSpeed: 50,
          showCursor: false,
          loop: false,
        });
        sessionStorage.setItem("user_id", response.data.tmp_user_id);
        sessionStorage.setItem("session_id", response.data.session_id);
      } else {
        Messages.value = response.data.messages || [];
      }
    })
    .catch((error) => {
      console.error("查询聊天记录历史请求错误：", error);
    });
});

onUnmounted(() => {
  if (typedInstance) {
    typedInstance.destroy(); // Stop typing and cleanup
  }
});

defineOptions({
  name: "IndexPage",
});
</script>

<style scoped>
.typing {
  display: inline-block;
}
</style>
