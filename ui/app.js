const shell = document.querySelector('[data-shell]');
const workspace = document.getElementById('workspace');
const workspaceTitle = document.getElementById('workspace-title');
const workspaceDesc = document.getElementById('workspace-desc');
const navItems = document.querySelectorAll('.nav-item');
const navTargets = document.querySelectorAll('[data-nav-target]');
const screens = document.querySelectorAll('[data-screen]');
const dialog = document.querySelector('[data-dialog]');
const dialogTitle = document.querySelector('[data-dialog-title]');
const dialogContent = document.querySelector('[data-dialog-content]');
const toastRegion = document.querySelector('[data-toast-region]');
const backgroundIndicator = document.querySelector('[data-background-indicator]');

const screenMeta = {
  overview: {
    title: '驾驶舱概览',
    description: '聚合关键指标与入口，方便验证整体跳转逻辑。'
  },
  chat: {
    title: '聊天主界面',
    description: '模拟实时对话气泡与情境侧栏，可在骨架中测试流程。'
  },
  learning: {
    title: '本地持续学习',
    description: '展示数据收集、模型迭代与效果验证的流程草图。'
  },
  content: {
    title: '内容展示看板',
    description: '布局推荐位、提醒列表与洞察摘要模块的示意。'
  },
  settings: {
    title: '设置中心',
    description: '语音、调度、隐私等配置区块占位，等待功能接入。'
  }
};

const dialogCopy = {
  journey: {
    title: '系统工作流说明',
    body: `
      <p>系统从语音唤醒开始，经过意图判断、任务调度到前端反馈。此弹窗用于向产品/研发说明整体路径。</p>
      <ol>
        <li>前端捕获入口事件并展示加载状态。</li>
        <li>本地模型快速判断是否命中意图。</li>
        <li>若命中则直接触发任务调度；未命中则准备云端兜底。</li>
        <li>结果回传后更新 UI，并同步写入持续学习模块。</li>
      </ol>
    `
  },
  timeline: {
    title: '任务时间线',
    body: `
      <p>时间线用于演示语音任务从唤醒到完成的关键节点。</p>
      <p>每个节点可映射到状态通知，方便在 Electron 中验证托盘/弹窗行为。</p>
    `
  },
  'chat-flow': {
    title: '聊天界面结构',
    body: `
      <p>聊天页面拆分为对话气泡区、输入区与右侧情境辅助区。</p>
      <p>后续可将占位列表替换为真实的行动建议与多模态组件。</p>
    `
  },
  context: {
    title: '情境侧栏草图',
    body: `
      <p>情境卡片采用栅格布局，可容纳推荐、提醒、快捷指令等信息。</p>
      <p>点击卡片后可进入更详细的配置或触发操作。</p>
    `
  },
  learning: {
    title: '持续学习流程',
    body: `
      <p>本地学习流程包含三段：采集、训练、自检。</p>
      <p>每块均预留给后端接入数据面板或进度条组件。</p>
    `
  },
  content: {
    title: '内容看板布局',
    body: `
      <p>内容看板将推荐卡片与提醒列表并列，右侧显示日程和洞察。</p>
      <p>该布局便于验证信息密度和视觉层级。</p>
    `
  },
  settings: {
    title: '设置中心分区',
    body: `
      <p>设置中心按照“语音与情绪”“任务调度”“网络隐私”分栏。</p>
      <p>按钮、开关等控件后续可根据真实需求替换。</p>
    `
  },
  shortcuts: {
    title: '建议快捷键',
    body: `
      <p>可在后续 Electron 集成阶段绑定以下快捷方式：</p>
      <ul>
        <li><kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>O</kbd>：打开驾驶舱</li>
        <li><kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>L</kbd>：切换到本地学习</li>
        <li><kbd>Ctrl</kbd> + <kbd>.</kbd>：唤起命令面板（预留）</li>
      </ul>
    `
  }
};

function setScreen(target) {
  const meta = screenMeta[target];
  screens.forEach((screen) => {
    const isMatch = screen.dataset.screen === target;
    screen.classList.toggle('is-active', isMatch);
    screen.setAttribute('aria-hidden', String(!isMatch));
  });

  navItems.forEach((btn) => {
    const isActive = btn.dataset.navTarget === target;
    btn.classList.toggle('is-active', isActive);
    btn.setAttribute('aria-pressed', String(isActive));
  });

  if (meta) {
    workspaceTitle.textContent = meta.title;
    workspaceDesc.textContent = meta.description;
  }

  workspace.focus({ preventScroll: true });
}

navTargets.forEach((btn) => {
  btn.addEventListener('click', () => setScreen(btn.dataset.navTarget));
});

const collapseButton = document.querySelector('[data-action="collapse-sidebar"]');
collapseButton?.addEventListener('click', () => {
  shell?.classList.toggle('window--sidebar-collapsed');
  const expanded = !shell?.classList.contains('window--sidebar-collapsed');
  collapseButton.setAttribute('aria-expanded', String(expanded));
});

function showToast(message, variant = 'info') {
  if (!toastRegion) return;

  const toast = document.createElement('div');
  toast.classList.add('toast');
  if (variant !== 'info') {
    toast.classList.add(`toast--${variant}`);
  }
  toast.setAttribute('role', variant === 'warning' ? 'alert' : 'status');
  toast.innerHTML = `
    <span aria-hidden="true">${variant === 'success' ? '✨' : variant === 'warning' ? '⚠️' : 'ℹ️'}</span>
    <span>${message}</span>
  `;

  toastRegion.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(16px)';
    toast.addEventListener(
      'transitionend',
      () => toast.remove(),
      { once: true }
    );
  }, 2800);
}

const toastButton = document.querySelector('[data-action="show-toast"]');
toastButton?.addEventListener('click', () => {
  showToast('提示示例：按钮和导航逻辑已准备就绪。', 'success');
});

const themeToggle = document.querySelector('[data-action="toggle-theme"]');
themeToggle?.addEventListener('click', () => {
  document.documentElement.classList.toggle('theme-dark');
  const isDark = document.documentElement.classList.contains('theme-dark');
  themeToggle.setAttribute('aria-label', isDark ? '切换到浅色主题' : '切换到深色主题');
  showToast(isDark ? '已启用暗色主题骨架。' : '切换回浅色主题。');
});

const dialogTriggers = document.querySelectorAll('[data-open-dialog]');
const dialogCloseButtons = document.querySelectorAll('[data-dialog-close]');

function openDialog(key) {
  if (!dialog || !dialogTitle || !dialogContent) return;
  const copy = dialogCopy[key] ?? {
    title: '模块说明',
    body: '<p>该模块的文案暂未配置。</p>'
  };
  dialogTitle.textContent = copy.title;
  dialogContent.innerHTML = copy.body;
  dialog.hidden = false;
  dialog.setAttribute('aria-hidden', 'false');
  dialog.querySelector('[data-dialog-close]')?.focus({ preventScroll: true });
}

function closeDialog() {
  if (!dialog) return;
  dialog.hidden = true;
  dialog.setAttribute('aria-hidden', 'true');
}

dialogTriggers.forEach((trigger) => {
  trigger.addEventListener('click', () => openDialog(trigger.dataset.openDialog));
});

dialogCloseButtons.forEach((btn) => btn.addEventListener('click', closeDialog));

dialog?.addEventListener('click', (event) => {
  if (event.target === dialog) {
    closeDialog();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeDialog();
  }
});

const backgroundToggle = document.querySelector('[data-action="toggle-background"]');
let backgroundActive = false;

function updateBackgroundIndicator(state) {
  if (!backgroundIndicator) return;
  backgroundIndicator.innerHTML = `${state ? '后台静默监听中' : '后台待命'}`;
  const dot = backgroundToggle?.querySelector('.chip__dot');
  dot?.classList.toggle('is-active', state);
  if (state) {
    backgroundToggle?.classList.add('chip--primary');
    backgroundToggle?.classList.remove('chip--ghost');
  } else {
    backgroundToggle?.classList.remove('chip--primary');
    backgroundToggle?.classList.add('chip--ghost');
  }
}

async function setBackgroundState(nextState) {
  backgroundActive = nextState;
  try {
    if (window.nudgepilotDesktop?.setBackgroundListening) {
      await window.nudgepilotDesktop.setBackgroundListening(nextState);
    }
    updateBackgroundIndicator(nextState);
    showToast(nextState ? '模拟开启后台监听。' : '已关闭后台监听。');
  } catch (error) {
    console.error(error);
    showToast('后台监听切换失败，请稍后重试。', 'warning');
  }
}

backgroundToggle?.addEventListener('click', () => {
  setBackgroundState(!backgroundActive);
});

if (window.nudgepilotDesktop?.getBackgroundListening) {
  window.nudgepilotDesktop.getBackgroundListening().then((state) => {
    updateBackgroundIndicator(Boolean(state));
    backgroundActive = Boolean(state);
  });

  window.nudgepilotDesktop.onBackgroundListeningChange?.(({ active }) => {
    updateBackgroundIndicator(Boolean(active));
    backgroundActive = Boolean(active);
  });
} else {
  updateBackgroundIndicator(false);
}

const openLearningButtons = document.querySelectorAll('[data-action="open-learning"]');
openLearningButtons.forEach((btn) => btn.addEventListener('click', () => setScreen('learning')));

const shortcutButton = document.querySelector('[data-action="show-shortcuts"]');
shortcutButton?.addEventListener('click', () => openDialog('shortcuts'));

setScreen('overview');
