const navButtons = document.querySelectorAll('[data-nav-target]');
const pages = document.querySelectorAll('[data-page]');
const tabs = document.querySelectorAll('[data-tab]');
const tabPanels = document.querySelectorAll('[data-tab-panel]');
const previewOverlay = document.querySelector('.preview-overlay');
const previewTitle = document.querySelector('[data-preview-title]');
const previewBody = document.querySelector('[data-preview-body]');
const workspace = document.getElementById('workspace');
const pinnedList = document.querySelector('[data-pinned-list]');
const composerStatus = document.querySelector('.composer__status');
const composerTextarea = document.querySelector('.composer textarea');
const messageList = document.querySelector('.message-list');
const attachmentsContainer = document.querySelector('[data-attachments]');
const toastRegion = document.querySelector('.toast-region');
const contentCards = document.querySelectorAll('.content-card');
const pinnedItems = new Set();
const desktopBridge = window.nudgepilotDesktop ?? null;
let attachmentSeed = 0;

function setActivePage(target) {
  pages.forEach((page) => {
    const isMatch = page.dataset.page === target;
    page.classList.toggle('is-active', isMatch);
    if (isMatch) {
      page.setAttribute('aria-hidden', 'false');
    } else {
      page.setAttribute('aria-hidden', 'true');
    }
  });

  navButtons.forEach((btn) => {
    const isActive = btn.dataset.navTarget === target;
    btn.classList.toggle('is-active', isActive);
    btn.setAttribute('aria-pressed', String(isActive));
  });

  if (workspace) {
    workspace.focus({ preventScroll: true });
  }
}

navButtons.forEach((btn) => {
  btn.addEventListener('click', () => setActivePage(btn.dataset.navTarget));
});

function showToast(message, variant = 'info') {
  if (!toastRegion) return;

  const icons = {
    success: '✨',
    info: 'ℹ️',
    warning: '⚠️',
  };

  const toast = document.createElement('div');
  toast.className = `toast toast--${variant}`;
  toast.setAttribute('role', 'status');
  toast.innerHTML = `
    <span class="toast__icon" aria-hidden="true">${icons[variant] ?? 'ℹ️'}</span>
    <span class="toast__message">${message}</span>
  `;

  toastRegion.appendChild(toast);

  setTimeout(() => {
    toast.addEventListener(
      'transitionend',
      () => {
        toast.remove();
      },
      { once: true }
    );
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(12px)';
  }, 2600);
}

function openOverlay({ title, body }) {
  if (!previewOverlay || !previewTitle || !previewBody) return;

  if (title) {
    previewTitle.textContent = title;
  }

  previewBody.innerHTML = '';

  if (typeof body === 'string') {
    previewBody.innerHTML = body;
  } else if (body instanceof Node) {
    previewBody.appendChild(body);
  }

  previewOverlay.classList.add('is-visible');
  previewOverlay.setAttribute('aria-hidden', 'false');
}

function closeOverlay() {
  if (!previewOverlay) return;
  previewOverlay.classList.remove('is-visible');
  previewOverlay.setAttribute('aria-hidden', 'true');
}

function setActiveContentCard(card) {
  if (!contentCards.length || !card) return;
  contentCards.forEach((item) => item.classList.remove('is-active'));
  card.classList.add('is-active');
}

function buildPreviewFromCard(card) {
  if (!card) {
    return '<p>未找到可预览的内容。</p>';
  }

  const title = card.querySelector('.content-card__header h3')?.textContent ?? '内容预览';
  const meta = card.querySelector('.content-card__header .tag')?.textContent ?? '';
  const body = card.querySelector('.content-card__body')?.innerHTML ?? '';
  const detail = card.querySelector('.content-card__detail')?.innerHTML ?? '';

  return `
    <h4>${title}</h4>
    ${meta ? `<p class="preview__meta">${meta}</p>` : ''}
    <div class="preview__content">${body}</div>
    ${detail ? `<div class="preview__extra">${detail}</div>` : ''}
  `;
}

function formatTime(date = new Date()) {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

function createMessageElement(role, text, options = {}) {
  const item = document.createElement('li');
  item.className = `message message--${role}`;
  if (options.modifier) {
    item.classList.add(options.modifier);
  }

  const avatar = document.createElement('div');
  avatar.className = 'message__avatar';
  avatar.setAttribute('aria-hidden', 'true');
  avatar.textContent = role === 'assistant' ? '🤖' : '👤';

  const bubble = document.createElement('div');
  bubble.className = 'message__bubble';

  const header = document.createElement('header');
  header.className = 'message__meta';

  const author = document.createElement('span');
  author.className = 'message__author';
  author.textContent = role === 'assistant' ? 'Ni' : '你';

  const timeEl = document.createElement('time');
  timeEl.className = 'message__time';
  timeEl.textContent = formatTime();

  header.append(author, timeEl);

  const body = document.createElement('p');
  body.textContent = text;

  bubble.append(header, body);

  if (options.footerContent || options.source) {
    const footer = document.createElement('footer');
    footer.className = 'message__footer';

    if (options.footerContent) {
      if (Array.isArray(options.footerContent)) {
        options.footerContent.forEach((element) => {
          if (element) {
            footer.append(element);
          }
        });
      } else {
        footer.append(options.footerContent);
      }
    }

    if (options.source) {
      const source = document.createElement('span');
      source.className = 'message__source';
      source.textContent = options.source;
      footer.append(source);
    }

    bubble.append(footer);
  }

  item.append(avatar, bubble);
  return item;
}

function setActiveTab(target) {
  tabs.forEach((tab) => {
    const isActive = tab.dataset.tab === target;
    tab.classList.toggle('is-active', isActive);
    tab.setAttribute('aria-selected', String(isActive));
  });

  tabPanels.forEach((panel) => {
    const isMatch = panel.dataset.tabPanel === target;
    panel.classList.toggle('is-active', isMatch);
    panel.setAttribute('aria-hidden', String(!isMatch));
  });
}

tabs.forEach((tab) => {
  tab.addEventListener('click', () => setActiveTab(tab.dataset.tab));
});

const themeToggle = document.querySelector('[data-action="toggle-theme"]');

if (themeToggle) {
  themeToggle.setAttribute('aria-pressed', String(document.body.classList.contains('theme-dark')));
  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('theme-dark');
    const isDark = document.body.classList.contains('theme-dark');
    themeToggle.setAttribute('aria-pressed', String(isDark));
    themeToggle.innerHTML = isDark ? '<span aria-hidden="true">☀️</span> 主题切换' : '<span aria-hidden="true">🌗</span> 主题切换';
    showToast(isDark ? '深色模式已启用，夜间使用更舒适。' : '已切换回浅色模式。', 'info');
  });
}

const appShell = document.querySelector('.app-shell');
const sidebarToggle = document.querySelector('[data-action="collapse-sidebar"]');

if (appShell && sidebarToggle) {
  sidebarToggle.addEventListener('click', () => {
    const isCollapsed = appShell.classList.toggle('is-sidebar-collapsed');
    sidebarToggle.setAttribute('aria-expanded', String(!isCollapsed));
    sidebarToggle.setAttribute('aria-label', isCollapsed ? '展开导航栏' : '折叠导航栏');
    showToast(isCollapsed ? '导航栏已收起，可集中于主要内容。' : '导航栏已展开。', 'info');
  });
}

const backgroundToggle = document.querySelector('[data-action="toggle-background-mode"]');
const backgroundStatus = document.querySelector('[data-background-status]');
const composerMessage = document.querySelector('[data-composer-message]');
const composerDot = document.querySelector('[data-composer-dot]');
const defaultComposerMessage = composerMessage?.textContent.trim() ?? '';
let backgroundListeningState = backgroundToggle?.getAttribute('aria-pressed') === 'true';

const applyBackgroundListeningState = (isActive, { silent = false } = {}) => {
  backgroundListeningState = Boolean(isActive);

  if (backgroundToggle) {
    backgroundToggle.setAttribute('aria-pressed', String(backgroundListeningState));
    backgroundToggle.innerHTML = backgroundListeningState
      ? '<span aria-hidden="true">🛑</span> 退出后台监听'
      : '<span aria-hidden="true">🎧</span> 后台静默聆听';
  }

  if (backgroundStatus) {
    backgroundStatus.hidden = !backgroundListeningState;
  }

  if (composerMessage) {
    composerMessage.textContent = backgroundListeningState
      ? '后台静默聆听已开启，等待唤醒词。'
      : defaultComposerMessage;
  }

  if (composerDot) {
    composerDot.classList.toggle('status-dot--listening', backgroundListeningState);
    composerDot.classList.toggle('status-dot--muted', !backgroundListeningState);
  }

  if (!silent) {
    showToast(
      backgroundListeningState
        ? '后台静默聆听已开启，将在唤醒词后自动响应。'
        : '已退出后台静默聆听模式。',
      backgroundListeningState ? 'success' : 'info'
    );
  }
};

const updateBackgroundListening = async (targetState) => {
  const desired = Boolean(targetState);

  if (!desktopBridge?.setBackgroundListening) {
    applyBackgroundListeningState(desired);
    return;
  }

  try {
    await desktopBridge.setBackgroundListening(desired);
    applyBackgroundListeningState(desired, { silent: true });
  } catch (error) {
    console.error('Failed to toggle background listening', error);
    showToast('切换后台监听失败，请稍后重试。', 'warning');
  }
};

if (backgroundToggle && backgroundStatus) {
  backgroundToggle.addEventListener('click', () => {
    updateBackgroundListening(!backgroundListeningState);
  });

  if (desktopBridge?.getBackgroundListening) {
    desktopBridge
      .getBackgroundListening()
      .then((isActive) => {
        applyBackgroundListeningState(Boolean(isActive), { silent: true });
      })
      .catch((error) => {
        console.error('Unable to read background listening state', error);
      });
  }

  if (desktopBridge?.onBackgroundListeningChange) {
    desktopBridge.onBackgroundListeningChange((payload) => {
      const nextState = typeof payload?.active === 'boolean' ? payload.active : Boolean(payload);
      const silent = Boolean(payload?.silent);
      applyBackgroundListeningState(nextState, { silent });
    });
  }
}

const minimizeToTrayButton = document.querySelector('[data-action="minimize-to-tray"]');

if (minimizeToTrayButton) {
  minimizeToTrayButton.addEventListener('click', async () => {
    if (!desktopBridge?.minimizeToTray) {
      showToast('挂起到托盘仅在桌面客户端可用。', 'warning');
      return;
    }

    try {
      await desktopBridge.minimizeToTray();
      showToast('界面已挂起到系统托盘，后台仍在等待唤醒。', 'info');
    } catch (error) {
      console.error('Failed to minimise to tray', error);
      showToast('挂起到托盘失败，请稍后再试。', 'warning');
    }
  });
}

const toggles = document.querySelectorAll('.toggle');

toggles.forEach((toggle) => {
  if (!toggle.dataset.initialState) {
    toggle.dataset.initialState = toggle.getAttribute('aria-checked') ?? 'false';
  }
  if (!toggle.dataset.initialLabel) {
    toggle.dataset.initialLabel = toggle.textContent.trim();
  }

  toggle.addEventListener('click', () => {
    const current = toggle.getAttribute('aria-checked') === 'true';
    toggle.setAttribute('aria-checked', String(!current));
    toggle.textContent = current ? '未开启' : '已开启';
  });

  toggle.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggle.click();
    }
  });
});

const hotwordToggle = document.querySelector('[data-hotword-toggle]');
const hotwordInput = document.querySelector('[data-hotword-input]');

if (hotwordToggle && hotwordInput) {
  const syncHotwordState = () => {
    const enabled = hotwordToggle.getAttribute('aria-checked') === 'true';
    hotwordInput.disabled = !enabled;
    hotwordInput.placeholder = enabled ? '例如：‘你好，Ni’' : '启用后可编辑唤醒词';
    hotwordInput.setAttribute('aria-disabled', String(!enabled));
  };

  syncHotwordState();

  hotwordToggle.addEventListener('click', () => {
    syncHotwordState();
    const enabled = hotwordToggle.getAttribute('aria-checked') === 'true';
    showToast(
      enabled ? `自动唤醒已开启，当前热词为「${hotwordInput.value || '未设置'}」。` : '自动唤醒已关闭。',
      enabled ? 'success' : 'info'
    );
    if (enabled) {
      hotwordInput.focus();
      hotwordInput.select();
    }
  });
}

const openLearningShortcut = document.querySelector('[data-action="open-learning"]');

if (openLearningShortcut) {
  openLearningShortcut.addEventListener('click', () => setActivePage('learning'));
}

const openPreviewButtons = document.querySelectorAll('[data-action="open-preview"], [data-action="open-content"]');

openPreviewButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const action = btn.dataset.action;

    if (action === 'open-content') {
      setActivePage('content');
      const scheduleCard = document.querySelector('[data-content="schedule"]');
      if (scheduleCard) {
        setActiveContentCard(scheduleCard);
        openOverlay({
          title: scheduleCard.querySelector('h3')?.textContent ?? '内容全屏预览',
          body: buildPreviewFromCard(scheduleCard),
        });
        showToast('已打开今日日程详情', 'info');
      }
      return;
    }

    const activeCard = document.querySelector('.content-card.is-active') ?? document.querySelector('.content-card');
    openOverlay({
      title: activeCard?.querySelector('h3')?.textContent ?? '内容全屏预览',
      body: buildPreviewFromCard(activeCard),
    });
    showToast('全屏预览已打开', 'info');
  });
});

const closePreviewButton = document.querySelector('[data-action="close-preview"]');

closePreviewButton?.addEventListener('click', () => {
  closeOverlay();
});

previewOverlay?.addEventListener('click', (event) => {
  if (event.target === previewOverlay) {
    closeOverlay();
  }
});

contentCards.forEach((card) => {
  card.addEventListener('click', () => {
    setActiveContentCard(card);
  });
});

const pinContentButtons = document.querySelectorAll('[data-action="pin-content"]');

pinContentButtons.forEach((button) => {
  button.addEventListener('click', () => {
    if (!pinnedList) return;

    const label = button.dataset.pinLabel ?? '固定内容';

    if (pinnedItems.has(label)) {
      showToast(`「${label}」已在侧栏中`, 'warning');
      return;
    }

    pinnedItems.add(label);

    const summary = button.dataset.pinSummary ?? '';
    pinnedList.querySelector('.pinned-empty')?.remove();

    const item = document.createElement('li');
    item.className = 'pinned-item';
    item.innerHTML = `
      <span class="pinned-item__title">${label}</span>
      <div class="pinned-item__meta">
        <span class="status-dot" aria-hidden="true"></span>
        <span>${summary || '已固定到主界面侧栏'}</span>
      </div>
    `;

    pinnedList.appendChild(item);
    button.disabled = true;
    button.textContent = '已固定';
    showToast(`已固定「${label}」到侧栏`, 'success');
  });
});

const toggleMicButton = document.querySelector('[data-action="toggle-mic"]');

toggleMicButton?.addEventListener('click', () => {
  const isPressed = toggleMicButton.getAttribute('aria-pressed') === 'true';
  const nextState = !isPressed;
  toggleMicButton.setAttribute('aria-pressed', String(nextState));
  toggleMicButton.classList.toggle('is-active', nextState);

  if (composerStatus) {
    const dotClass = nextState ? 'status-dot--listening' : 'status-dot--muted';
    const message = nextState ? '语音聆听中…' : '麦克风已静音';
    composerStatus.innerHTML = `<span class="status-dot ${dotClass}" aria-hidden="true"></span>${message}`;
  }

  showToast(nextState ? '已开启语音聆听' : '麦克风已静音', nextState ? 'info' : 'warning');
});

const insertAttachmentButton = document.querySelector('[data-action="insert-attachment"]');

insertAttachmentButton?.addEventListener('click', () => {
  if (!attachmentsContainer) return;

  attachmentSeed += 1;
  const label = `附件 ${attachmentSeed}`;

  const chip = document.createElement('span');
  chip.className = 'attachment-chip';
  chip.innerHTML = `
    <span aria-hidden="true">📄</span>${label}
    <button type="button" class="attachment-chip__remove" aria-label="移除${label}">×</button>
  `;

  attachmentsContainer.appendChild(chip);
  showToast(`${label} 已添加`, 'success');
});

attachmentsContainer?.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  if (target.matches('.attachment-chip__remove')) {
    event.preventDefault();
    target.closest('.attachment-chip')?.remove();
    showToast('附件已移除', 'info');
  }
});

const insertCommandButton = document.querySelector('[data-action="insert-command"]');

insertCommandButton?.addEventListener('click', () => {
  if (!composerTextarea) return;
  const template = '/remind 15:00 客户会议 准备资料';
  const current = composerTextarea.value.trim();
  composerTextarea.value = current ? `${current}\n${template}` : template;
  composerTextarea.focus();
  showToast('已插入快捷指令模板', 'info');
});

const sendButton = document.querySelector('[data-action="send-message"]');

if (composerTextarea && sendButton) {
  sendButton.addEventListener('click', () => {
    const text = composerTextarea.value.trim();
    const attachmentsCount = attachmentsContainer?.children.length ?? 0;

    if (!text && attachmentsCount === 0) {
      showToast('请输入内容或添加附件后再发送', 'warning');
      composerTextarea.focus();
      return;
    }

    if (text && messageList) {
      const userMessage = createMessageElement('user', text);
      messageList.appendChild(userMessage);
      userMessage.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }

    if (attachmentsCount > 0 && messageList) {
      const infoMessage = createMessageElement('assistant', `已附加 ${attachmentsCount} 个附件，稍后会一并处理。`, {
        source: '附件提醒',
      });
      messageList.appendChild(infoMessage);
    }

    if (attachmentsContainer) {
      attachmentsContainer.innerHTML = '';
    }

    if (messageList) {
      const assistantPlaceholder = createMessageElement('assistant', 'Ni 正在生成回应…', {
        modifier: 'message--typing',
      });
      messageList.appendChild(assistantPlaceholder);
      assistantPlaceholder.scrollIntoView({ behavior: 'smooth', block: 'end' });

      setTimeout(() => {
        const paragraph = assistantPlaceholder.querySelector('p');
        if (paragraph) {
          paragraph.textContent = '收到，我会在会议前 30 分钟提醒并准备相关资料。';
        }
        assistantPlaceholder.classList.remove('message--typing');
      }, 1600);
    }

    composerTextarea.value = '';
    composerTextarea.placeholder = '消息已发送 · 等待 Ni 的响应…';
    showToast('消息已发送', 'success');
  });
}

const triggerTraining = document.querySelector('[data-action="trigger-training"]');

triggerTraining?.addEventListener('click', () => {
  triggerTraining.textContent = '训练中…';
  triggerTraining.disabled = true;
  showToast('持续学习训练已启动', 'info');

  const progressBars = document.querySelectorAll('.progress__bar span');
  progressBars.forEach((bar, index) => {
    if (!bar.dataset.originalWidth) {
      bar.dataset.originalWidth = bar.style.width;
    }
    bar.style.width = index === 0 ? '96%' : '82%';
  });

  setTimeout(() => {
    triggerTraining.textContent = '立即训练';
    triggerTraining.disabled = false;
    progressBars.forEach((bar) => {
      if (bar.dataset.originalWidth) {
        bar.style.width = bar.dataset.originalWidth;
      }
    });
    showToast('训练完成 · 指标已更新', 'success');
  }, 2000);
});

const resetButton = document.querySelector('[data-action="reset-settings"]');

resetButton?.addEventListener('click', () => {
  toggles.forEach((toggle) => {
    const defaultState = toggle.dataset.initialState ?? 'false';
    const defaultLabel = toggle.dataset.initialLabel ?? (defaultState === 'true' ? '已开启' : '未开启');
    toggle.setAttribute('aria-checked', defaultState);
    toggle.textContent = defaultLabel;
  });

  document
    .querySelectorAll('.tab-panel select')
    .forEach((select) => {
      select.selectedIndex = 0;
    });

  const sliderInput = document.querySelector('.slider input[type="range"]');
  const sliderValue = document.querySelector('.slider span');
  if (sliderInput && sliderValue) {
    const defaultValue = sliderInput.getAttribute('value') ?? sliderInput.defaultValue ?? '200';
    sliderInput.value = defaultValue;
    sliderValue.textContent = `${defaultValue} MB`;
  }

  showToast('设置已恢复默认值', 'info');
});

const managePackButton = document.querySelector('[data-action="manage-pack"]');

managePackButton?.addEventListener('click', () => {
  openOverlay({
    title: '管理语音包',
    body: `
      <p class="preview__meta">CosyVoice 0.5B · 占用 1.2GB</p>
      <div class="preview__content">
        <p>可选择更新离线语音资源、调整优先级或卸载释放空间。</p>
        <ul class="detail-list">
          <li>最新补丁：2024-03-10（语速优化）</li>
          <li>语音缓存：324MB，可一键清理</li>
          <li>备用语音：Edge TTS，将在离线降级时启用</li>
        </ul>
      </div>
    `,
  });
  showToast('已打开语音包管理', 'info');
});

const connectCloudButton = document.querySelector('[data-action="connect-cloud"]');

connectCloudButton?.addEventListener('click', () => {
  openOverlay({
    title: '配置云端语音服务',
    body: `
      <p>授权后将在离线资源不足时自动切换到 Edge TTS。</p>
      <ul class="detail-list">
        <li>步骤一：登录账号并完成双因素验证</li>
        <li>步骤二：勾选允许上传 15 秒音频片段进行匹配</li>
        <li>步骤三：设置每月流量上限与联网时间段</li>
      </ul>
    `,
  });
  showToast('请完成云端授权', 'warning');
});

const viewKeywordsButton = document.querySelector('[data-action="view-keywords"]');

viewKeywordsButton?.addEventListener('click', () => {
  const keywords = Array.from(document.querySelectorAll('.keyword-badges .badge')).map((badge) => `<li>${badge.textContent}</li>`).join('');
  openOverlay({
    title: '关键词向量库',
    body: `
      <p class="preview__meta">最近新增 12 条关键词</p>
      <div class="preview__content">
        <p>以下关键词将用于意图识别的召回增强：</p>
        <ul class="detail-list">${keywords}</ul>
      </div>
    `,
  });
  showToast('关键词列表已载入', 'info');
});

const viewLogButtons = document.querySelectorAll('[data-action="view-log"]');

viewLogButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const title = button.dataset.logTitle ?? button.closest('.timeline__content')?.querySelector('h4')?.textContent ?? '学习记录详情';
    const detail = button.dataset.logDetail ?? button.closest('.timeline__content')?.querySelector('p')?.textContent ?? '暂无更多细节。';
    const time = button.dataset.logTime ?? button.closest('.timeline__item')?.querySelector('.timeline__time')?.textContent ?? '';

    openOverlay({
      title,
      body: `
        ${time ? `<p class="preview__meta">${time}</p>` : ''}
        <div class="preview__content">
          <p>${detail}</p>
          <ul class="detail-list">
            <li>训练耗时：4 分 12 秒</li>
            <li>样本覆盖：最近 3 天对话与纠错记录</li>
            <li>准确率：提升 3%，召回率 +2%</li>
          </ul>
        </div>
      `,
    });

    showToast('已打开训练记录详情', 'info');
  });
});

const shareContentButton = document.querySelector('[data-action="share-content"]');

shareContentButton?.addEventListener('click', () => {
  const activeCard = document.querySelector('.content-card.is-active') ?? document.querySelector('.content-card');
  const title = activeCard?.querySelector('h3')?.textContent ?? '内容';

  openOverlay({
    title: `分享「${title}」`,
    body: `
      <p>选择要分享的渠道：</p>
      <ul class="detail-list">
        <li>生成只读链接</li>
        <li>导出 Markdown / PDF</li>
        <li>发送到团队共享空间</li>
      </ul>
    `,
  });

  showToast('分享面板已打开', 'info');
});

const detailButtons = document.querySelectorAll('[data-action="open-detail"]');

detailButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const card = button.closest('.content-card');
    if (!card) return;

    const target = button.dataset.detailTarget;
    const detail = target ? card.querySelector(`[data-detail="${target}"]`) : card.querySelector('.content-card__detail');
    if (!detail) return;

    const isHidden = detail.hasAttribute('hidden');
    if (isHidden) {
      detail.removeAttribute('hidden');
      card.classList.add('is-expanded');
      button.textContent = '收起';
      showToast(`已展开「${card.querySelector('h3')?.textContent ?? '内容'}」`, 'info');
    } else {
      detail.setAttribute('hidden', 'true');
      card.classList.remove('is-expanded');
      button.textContent = '展开';
    }
  });
});

const pinChatButtons = document.querySelectorAll('[data-action="pin-chat"]');

pinChatButtons.forEach((button) => {
  button.addEventListener('click', () => {
    if (!messageList) return;

    const source = button.dataset.chatSource ?? '内容';
    const text = button.dataset.chatMessage ?? '内容已同步至聊天窗口，稍后可继续跟进。';

    const footerNote = document.createElement('span');
    footerNote.className = 'message__source';
    footerNote.textContent = `来源：${source}`;

    const assistantMessage = createMessageElement('assistant', text, {
      footerContent: [footerNote],
    });

    messageList.appendChild(assistantMessage);
    assistantMessage.scrollIntoView({ behavior: 'smooth', block: 'end' });
    button.disabled = true;
    button.textContent = '已发送';
    showToast(`已将「${source}」发送到对话`, 'success');
  });
});

// 默认展示主界面与通用设置
setActivePage('chat');
setActiveTab('general');


