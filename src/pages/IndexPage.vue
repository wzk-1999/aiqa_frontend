<template>
  <div class="flex flex-center">
    <span
      id="typed-output"
      class="typing text-h5 text-weight-bold q-my-xl"
      v-show="showCards && !captchaImageUrl"
    ></span>

    <div class="q-pa-md full-width" v-if="showCards && !captchaImageUrl">
      <div class="row q-gutter-md q-mb-md justify-center">
        <q-card class="col-4">
          <q-card-section class="bg-primary text-white">
            <div class="text-h6">Our Changing Planet</div>
            <div class="text-subtitle2">by John Doe</div>
          </q-card-section>

          <q-separator />

          <q-card-actions align="right">
            <q-btn flat>Action 1</q-btn>
            <q-btn flat>Action 2</q-btn>
          </q-card-actions>
        </q-card>

        <q-card class="col-4">
          <q-card-section class="bg-purple text-white">
            <div class="text-h6">Our Changing Planet</div>
            <div class="text-subtitle2">by John Doe</div>
          </q-card-section>

          <q-card-actions align="around">
            <q-btn flat>Action 1</q-btn>
            <q-btn flat>Action 2</q-btn>
          </q-card-actions>
        </q-card>
      </div>

      <div class="row q-gutter-md justify-center">
        <q-card class="col-4">
          <q-card-section class="bg-teal text-white">
            <div class="text-h6">Our Changing Planet</div>
            <div class="text-subtitle2">by John Doe</div>
          </q-card-section>

          <q-card-actions vertical align="right">
            <q-btn flat>Action 1</q-btn>
            <q-btn flat>Action 2</q-btn>
          </q-card-actions>
        </q-card>

        <q-card class="col-4">
          <q-card-section class="bg-grey-8 text-white">
            <div class="text-h6">Our Changing Planet</div>
            <div class="text-subtitle2">by John Doe</div>
          </q-card-section>

          <q-card-actions vertical align="center">
            <q-btn flat>Action 1</q-btn>
            <q-btn flat>Action 2</q-btn>
          </q-card-actions>
        </q-card>
      </div>
    </div>
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
      class="q-pr-xl q-pl-md q-py-md row full-width justify-end chatMessageContainer"
      ref="chatMessageContainer"
    >
      <q-chat-message
        v-for="(message, index) in Messages"
        :key="message.message_id"
        :text="[message.content]"
        :sent="message.type === 'user'"
        :avatar="message.type === 'assistant' ? '/cas_logo.jpg' : undefined"
        class="text-left"
        :bg-color="message.type === 'assistant' ? 'grey-2' : 'blue-7'"
        :text-color="message.type === 'user' ? 'white' : null"
        :style="message.type === 'assistant' ? 'width: 100%' : 'width: 65%;'"
      >
        <template v-slot:default>
          <template v-if="isAssistantLoading && !message.content">
            <q-circular-progress
              indeterminate
              rounded
              size="2rem"
              color="lime"
              class="q-ma-md"
            />
          </template>
          <template v-else>
            <!-- Render the processed Markdown content using v-html -->
            <div v-html="renderMarkdown(index, message.content)"></div>
          </template>
        </template>
        <template v-slot:stamp>
          <div
            class="q-pt-sm text-left q-gutter-sm"
            v-show="message.message_id"
          >
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
          <RelatedQuestion
            :relatedQuestions="yourRelatedQuestionsArray"
            v-if="
              message.type === 'assistant' &&
              index == Messages.length - 1 &&
              yourRelatedQuestionsArray.length > 0
            "
          />
        </template>
      </q-chat-message>
    </div>
    <q-footer class="bg-white q-pr-xl q-pl-md">
      <q-input
        rounded
        outlined
        v-model="userInput"
        :label="
          captchaImageUrl ? '继续使用之前，请完成人机校验' : '请输入您的问题'
        "
        class="q-mb-md"
        @keypress.enter="sendSSEPostRequest(userInput)"
        :readonly="captchaImageUrl ? true : false"
        type="textarea"
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
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from "vue";
import Typed from "typed.js";
import axios from "axios";
import { useQuasar } from "quasar";
import { SSE } from "sse.js"; // Import SSE from the library
import MarkdownIt from "markdown-it"; // Import MarkdownIt
import hljs from "highlight.js";
import { v4 as uuidv4 } from "uuid"; // Use a library like uuid to generate unique IDs
import "highlight.js/styles/github-dark.css";
import { useRoute } from "vue-router";
import RelatedQuestion from "../components/RelatedQuestion.vue";
import { useSessionStore } from "src/stores/session_ids";
import { useclickedQuestionIndexStore } from "../stores/clickedQuestionIndex";

const route = useRoute();
const current_session_index = computed(() => {
  return route.params.current_session_index
    ? parseInt(route.params.current_session_index, 10)
    : 0;
});

const $q = useQuasar();
const API_URL = import.meta.env.VITE_API_URL;

const clickedQuestionIndexStore = useclickedQuestionIndexStore();
watch(
  () => clickedQuestionIndexStore.clickedQuestionIndex,
  (newValue) => {
    if (newValue !== null) {
      const question =
        yourRelatedQuestionsArray.value[
          clickedQuestionIndexStore.clickedQuestionIndex
        ];
      // console.log(question);
      sendSSEPostRequest(question);
    }
  }
);

const isSending = ref(false);
const iconName = ref("send");
const chatMessageContainer = ref(null);

const tooltipText = ref("发送");

// use watch, otherwise the icon can't render immediately
watch(isSending, (newValue) => {
  iconName.value = newValue ? "stop_circle" : "send";
  tooltipText.value = newValue ? "停止生成" : "发送";
});

const Messages = ref([]); // Store messages as an array
const userInput = ref("");
const captchaInput = ref(""); // Store user input for the captcha
const showCards = ref(false);
const captchaImageUrl = ref(null); // Store the captcha image URL

const isAssistantLoading = ref(false);

const md = new MarkdownIt({
  linkify: true,
  html: true,
  highlight: function (str, lang) {
    // console.log("run");
    if (lang && hljs.getLanguage(lang)) {
      try {
        // console.log("Highlighting with lang:", lang);
        return hljs.highlight(str, { language: lang }).value;
      } catch (__) {}
    }

    return ""; // 使用额外的默认转义
  },
});

let currentBotMessageIndex = 0; // Track the current assistant message index for SSE
let sseSource = null;

// Method to process and render markdown content
const renderMarkdown = (messageIndex, content) => {
  let cleanedContent;

  if (
    Messages.value[messageIndex].quotes &&
    Messages.value[messageIndex].quote_file
  ) {
    // 用于记录匹配到的次数，即当前要获取的quotes中的索引位置
    let matchCount = 0;

    // 根据##\d+\$\$中的数字索引，从Messages.value[messageIndex].quotes中获取对应内容并替换
    const quoteRegex = /##(\d+)\$\$[。.;；]*/g;
    // 假如引用内容后面还有符号，把他删掉，以免影响后面的渲染
    cleanedContent = content.replace(quoteRegex, (match, index) => {
      // 根据匹配到的次数获取quotes中的对应内容
      const quoteContent = Messages.value[messageIndex].quotes[matchCount];
      const quoteCaption = Messages.value[messageIndex].quote_file[matchCount];
      // console.log(quoteCaption);
      matchCount++;

      return (
        "\n<details><summary>" +
        quoteCaption +
        " ...</summary>\n\n" +
        quoteContent +
        "</details>\n\n"
      );
    }); // 回车是必须的, 两个回车防止<http://help.cstnet.cn/redianwenti/zhuanyongmima.html> 被当成闭合的http: 标签，告诉markdown这是markdown不再是html了
  } else {
    cleanedContent = content;
  }
  // if (messageIndex === 1) {
  //   console.log(cleanedContent);
  // }

  cleanedContent = cleanedContent.replace(
    /\*\*(['"“‘])(.*?)([”'"’])\*\*/g,
    "**$2**"
  );

  // console.log(cleanedContent);
  const htmlContent = md.render(cleanedContent);

  // Custom CSS for headings
  const customStyles = `
  <style>
    h1{
      font-size: 2.5em; /* 调整字体大小 */
      font-weight: bold; /* 加粗 */
    }
        h2{
      font-size: 2em; /* 调整字体大小 */
      font-weight: bold; /* 加粗 */
    }
        h3{
      font-size: 1.6em; /* 调整字体大小 */
      font-weight: bold; /* 加粗 */
    }
        h4{
      font-size: 1.2em; /* 调整字体大小 */
      font-weight: bold; /* 加粗 */
    }
      pre{
      background-color: black;
      padding:1rem;
      border-radius:1rem
    }
      table { width: 100%; border-collapse: collapse; }
      th, td { padding: 0.5em; border: 1px solid #ddd; text-align: center; }
      th { background-color: #f4f4f4; font-weight: bold; }
      img{
      display:block;
      margin:1rem;
      }
      summary{
      color: blue;
      padding: 0.5rem;
      list-style: none; /* 确保列表样式不冲突 */
      cursor: pointer; /* 鼠标样式 */
      font-style: normal;
      }
      summary::before {
        content: "▶"; /* 添加黑三角 */
        display: inline-block;
        margin-right: 5px; /* 调整与文字的距离 */
        transform: rotate(0deg); /* 默认状态下的三角形方向 */
        transition: transform 0.2s ease; /* 动画效果 */
      }
      details[open] summary::before {
        transform: rotate(90deg); /* 展开时旋转黑三角 */
      }
      details{
        background: #ede8e8;
        border-left: 0.5rem solid #ccc;
        padding: 0.5em 1rem;
        margin: 1rem 0.5rem;
        font-style: italic;
        line-height: 1.8;
      }
  </style>
`;
  // 第一步：添加特定逻辑的 span 标签
  const tempContent = htmlContent.replace(
    /<pre><code class="language-(\w+)">/g,
    '<span class="bg-dark q-pa-sm text-white rounded-borders">$1</span><pre><code class="language-$1">'
  );

  const parser = new DOMParser();
  const doc = parser.parseFromString(tempContent, "text/html");

  const codeElements = doc.querySelectorAll("pre code");
  codeElements.forEach((code) => {
    code.classList.add("text-white");
  });

  // 处理链接，添加样式类
  const linkElements = doc.querySelectorAll("a");
  linkElements.forEach((link) => {
    link.classList.add("bg-grey-2", "text-blue");
  });
  // if (messageIndex === 1) {
  //   console.log(doc.body);
  // }
  return customStyles + new XMLSerializer().serializeToString(doc.body);
};

const handleCopy = (text) => {
  if (navigator.clipboard) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        $q.notify({
          message: "复制成功",
          type: "positive", // Success message
        });
      })
      .catch((error) => {
        console.error("使用 navigator.clipboard 复制失败：", error);
        // 如果 navigator.clipboard 失败，尝试 document.execCommand('copy')
        const textarea = document.createElement("textarea");
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        try {
          document.execCommand("copy");
          $q.notify({
            message: "复制成功",
            type: "positive", // Success message
          });
        } catch (err) {
          console.error("复制失败：", err);
          $q.notify({
            message: "复制失败，请手动复制",
            type: "negative", // Error message
          });
        } finally {
          document.body.removeChild(textarea);
        }
      });
  } else {
    // 如果不支持 navigator.clipboard，直接使用 document.execCommand('copy')
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand("copy");
      $q.notify({
        message: "复制成功",
        type: "positive", // Success message
      });
    } catch (err) {
      console.error("复制失败：", err);
      $q.notify({
        message: "复制失败，请手动复制",
        type: "negative", // Error message
      });
    } finally {
      document.body.removeChild(textarea);
    }
  }
};

const handleLikeToggle = async (messageId) => {
  const message = Messages.value.find((msg) => msg.message_id === messageId);
  // console.log("run");
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
    isAssistantLoading.value = false;
    sseSource = null; // 可选：将 sseSource 设置为 null 以表示没有活动的连接
  }
  isSending.value = false;
};

const sendSSEPostRequest = (question) => {
  if (question) {
    axios.get(`${API_URL}api/v1/check/captcha/necessity/`).then((response) => {
      if (response.data.captcha_required) {
        generateCaptcha();
        return;
      } else {
        const sessionId = JSON.parse(sessionStorage.getItem("session_ids"))[
          current_session_index.value
        ];
        const userID = sessionStorage.getItem("user_id");
        const message_id = uuidv4();

        // Push the user message with a unique ID
        Messages.value.push({
          message_id: message_id,
          content: question,
          type: "user",
          user_id: userID,
          session_id: sessionId,
        });

        userInput.value = ""; // Clear the input after submission
        showCards.value = false;
        yourRelatedQuestionsArray.value = [];
        sessionStorage.removeItem(`relatedQuestions_${sessionId}`);

        nextTick(() => {
          if (chatMessageContainer.value) {
            chatMessageContainer.value.scrollTop =
              chatMessageContainer.value.scrollHeight;
          }
        });

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
        // 当开始发送请求时，设置isAssistantLoading为true
        isAssistantLoading.value = true;

        if (currentBotMessageIndex === 0) {
          Messages.value.push({
            type: "assistant",
            content: "",
            user_id: userID,
            session_id: sessionId,
          });
          currentBotMessageIndex = Messages.value.length - 1;
          current_index = 0;
        }
        // Listen for incoming messages
        sseSource.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.message) {
            // console.log("currentBotMessageIndex is" + currentBotMessageIndex);
            // 收到第一个消息块时，将isAssistantLoading设置为false
            isAssistantLoading.value = false;
            if (data.quote) {
              Messages.value[currentBotMessageIndex].quotes = data.quote;
              Messages.value[currentBotMessageIndex].quote_file =
                data.quote_file;
            }

            addMessageToQueue(data.message, currentBotMessageIndex);
          } else if (data.messages_id) {
            isSending.value = false;
            Messages.value[currentBotMessageIndex].message_id =
              data.messages_id;
            currentBotMessageIndex = 0;
          } else if (data.related_questions) {
            yourRelatedQuestionsArray.value = data.related_questions;
            sessionStorage.setItem(
              `relatedQuestions_${sessionId}`,
              JSON.stringify(yourRelatedQuestionsArray.value)
            );
            // console.log(yourRelatedQuestionsArray.value);
          } else if (data.error) {
            $q.notify({
              message: data.error,
              type: "negative",
              timeout: 800,
            });
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
      message: "您没有输入内容或选中相关问题哦",
      type: "warning", // success message
      timeout: 800,
    });
  }
};

const handleSSEAvatarClick = () => {
  if (isSending.value) {
    stopSSERequest();
  } else {
    sendSSEPostRequest(userInput.value);
  }
};

const yourRelatedQuestionsArray = ref([]);

const retrieveRelatedQuestionsFromSessionStorage = (sessionId) => {
  const storedQuestions = sessionStorage.getItem(
    `relatedQuestions_${sessionId}`
  );

  if (storedQuestions) {
    return JSON.parse(storedQuestions);
  }
  return [];
};

let typedInstance = null;
let userID = sessionStorage.getItem("user_id");
const finalUserID = userID && userID !== "undefined" ? userID : "";

const generateCaptcha = () => {
  //console.log(userID);
  axios
    .get(`${API_URL}api/v1/get_captcha/${finalUserID}`, {
      responseType: "blob", // Important: set responseType to blob to handle the image
      withCredentials: true, // Include cookies in the request
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
  // console.log(captchaInput.value + " userid:" + userID);
  if (captchaInput.value.trim()) {
    axios
      .post(
        `${API_URL}api/v1/verify_captcha/`,
        {
          user_id: userID,
          captcha_input: captchaInput.value,
        },
        {
          withCredentials: true, // 发送凭据
        }
      )
      .then((verifyResponse) => {
        captchaInput.value = "";
        $q.notify({
          message: verifyResponse.data.message,
          type: verifyResponse.data.result ? "positive" : "negative",
        });
        if (verifyResponse.data.result) {
          captchaImageUrl.value = null;
          fetchAndHandleData();
        } else {
          generateCaptcha();
        }
      })
      .catch((error) => {
        $q.notify({
          message: error,
          type: "negative",
        });
      });
  } else {
    $q.notify({
      message: "验证码不能为空",
      type: "warning",
    });
  }
};

const fetchAndHandleData = () => {
  const sessionId = JSON.parse(sessionStorage.getItem("session_ids"));
  let finalSessionId = "";
  if (sessionId) {
    finalSessionId = sessionId[current_session_index.value];
    if (finalSessionId === undefined) {
      finalSessionId = "";
    }
  }
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
        if (!finalUserID) {
          sessionStorage.setItem("user_id", response.data.tmp_user_id);
        }
        if (!finalSessionId) {
          const sessionStore = useSessionStore();
          sessionStore.addSessionId(response.data.session_id);
          finalSessionId = JSON.parse(sessionStorage.getItem("session_ids"))[
            current_session_index.value
          ];
        }
        Messages.value = [];
        showCards.value = true;
      } else {
        Messages.value = response.data.messages || [];

        showCards.value = false;
      }
    })
    .catch((error) => {
      $q.notify({
        message: `查询聊天记录历史请求错误：${error}`,
        type: "negative",
      });
    });
  yourRelatedQuestionsArray.value =
    retrieveRelatedQuestionsFromSessionStorage(finalSessionId);
  // console.log(yourRelatedQuestionsArray.value);
};

onMounted(() => {
  fetchAndHandleData();
});

watch(
  () => route.params.current_session_index,
  () => {
    fetchAndHandleData();
  }
);

onUnmounted(() => {
  if (typedInstance) {
    typedInstance.destroy(); // Stop typing and cleanup
  }
});

// 消息队列
const messageQueue = [];
let typingInterval = null;
let current_index = 0;

const addMessageToQueue = (message, currentMessageIndex) => {
  messageQueue.push(message);
  if (!typingInterval) {
    startTypingEffect(currentMessageIndex);
  }
};

const startTypingEffect = (currentMessageIndex) => {
  if (messageQueue.length > 0) {
    const fullMessage = messageQueue[0];
    // let displayedMessage = Messages.value[currentMessageIndex].content || "";
    let displayedMessage = fullMessage.substring(0, current_index);
    typingInterval = setInterval(() => {
      if (current_index < fullMessage.length) {
        displayedMessage += fullMessage[current_index];
        // console.log(current_index);
        Messages.value[currentMessageIndex].content = displayedMessage;
        current_index++;
      } else {
        clearInterval(typingInterval);
        typingInterval = null;
        messageQueue.shift();
        // console.log("after chunk:", current_index);
        startTypingEffect(currentMessageIndex);
      }
    }, 50);

    // 滚动聊天消息容器到底部
    nextTick(() => {
      // console.log("run");
      if (chatMessageContainer.value) {
        // console.log(chatMessageContainer.value.scrollHeight);
        chatMessageContainer.value.scrollTop =
          chatMessageContainer.value.scrollHeight;
      }
    });
  }
};

defineOptions({
  name: "IndexPage",
});
</script>

<style scoped>
.chatMessageContainer {
  /* adjust to make the height reasonable, but must set, if didn't set auto scroll won't work*/
  height: 69vh;
  overflow: auto;
}
</style>
