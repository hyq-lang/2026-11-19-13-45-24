import { useCallback, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import './App.css';
import { useSiteAnimations } from './animations';
import { site } from './data';
import { enterProject, exitProject } from './transitions';
import DarkVeil from './components/DarkVeil';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Experience from './components/Experience';
import Work from './components/Work';
import Strengths from './components/Strengths';
import Contact from './components/Contact';
import ProjectDetail from './components/ProjectDetail';

type Project = (typeof site.work.projects)[number];

const PROJECTS = site.work.projects;

/** 从 hash 中解析项目 id：#project/01 */
function projectIdFromHash(): string | null {
  const m = /^#project\/(\d+)$/.exec(window.location.hash);
  return m ? m[1] : null;
}

/** 查询项目卡片封面（退出转场缩回的目标），供非点击来源（前进/直达）使用 */
function findCard(projectId: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-project-source="${projectId}"]`);
}

export default function App() {
  // GSAP 动效系统（首屏 opening + 滚动进场 + 视差），内部含减少动效/兜底处理
  useSiteAnimations();

  const progressRef = useRef<HTMLDivElement>(null);
  // DarkVeil 是 fixed 全屏 WebGL，首屏被不透明 Hero 视频遮住。
  // 延迟到接近第二屏时才挂载，避免首屏白白跑重着色器。
  const [veilActive, setVeilActive] = useState(false);
  const veilActivated = useRef(false);

  // ---------- 项目详情轻量路由 ----------
  const [activeProject, setActiveProject] = useState<Project | null>(() => {
    const id = projectIdFromHash();
    return PROJECTS.find((p) => p.id === id) ?? null;
  });
  // 始终跟踪当前打开的详情，供 popstate / 退出转场同步读取（避免闭包拿到旧 state）
  const currentProject = useRef<Project | null>(activeProject);
  // 进入详情前的主页滚动位置；退出时精确恢复
  const savedScroll = useRef(0);
  // 主页滚动是否已锁定（详情页内部自行滚动）
  const detailOpen = useRef(false);
  // 转场进行中标记：防止动画期间重复进入 / 退出
  const transitioning = useRef(false);
  // 返回按钮触发 history.back() 后、popstate 到来前的挂起标记：防止连点重复回退
  const navPending = useRef(false);

  // 首屏直达详情：同步锁定主页滚动；普通首页：打历史标记供返回时精确 back
  useEffect(() => {
    if (projectIdFromHash()) {
      detailOpen.current = true;
      document.body.classList.add('detail-lock');
    } else if (!window.history.state) {
      window.history.replaceState({ wbPort: 'work' }, '', window.location.href);
    }
  }, []);

  /** 转场收尾后校正状态：应对「动画进行中按了浏览器前进/后退」被忽略的情况 */
  const reconcileHash = useCallback(() => {
    const id = projectIdFromHash();
    const next = id ? PROJECTS.find((p) => p.id === id) ?? null : null;
    const cur = currentProject.current;
    if (next && !cur) {
      currentProject.current = next;
      flushSync(() => setActiveProject(next));
      detailOpen.current = true;
      document.body.classList.add('detail-lock');
    } else if (!next && cur) {
      currentProject.current = null;
      flushSync(() => setActiveProject(null));
      detailOpen.current = false;
      document.body.classList.remove('detail-lock');
      window.scrollTo({ top: savedScroll.current, behavior: 'instant' as ScrollBehavior });
    }
  }, []);

  /** 进入动画结束：解锁挂起 + 锁定主页滚动，并校正可能的路由漂移 */
  const lockAfterEnter = useCallback(() => {
    transitioning.current = false;
    if (!detailOpen.current) {
      detailOpen.current = true;
      document.body.classList.add('detail-lock');
    }
    reconcileHash();
  }, [reconcileHash]);

  /** 卡片点击进入：pushState 一条详情历史（保留浏览器前进能力） */
  const openProject = useCallback(
    (project: Project, source: HTMLElement | null) => {
      if (transitioning.current || currentProject.current) return;
      transitioning.current = true;
      // 点击瞬间记录，最准确还原「进入前」的滚动位置
      savedScroll.current = window.scrollY;
      const commit = () => {
        currentProject.current = project;
        flushSync(() => setActiveProject(project));
        if (window.location.hash !== `#project/${project.id}`) {
          window.history.pushState(
            { wbPort: 'detail', projectId: project.id },
            '',
            `#project/${project.id}`,
          );
        }
      };
      enterProject(source ?? findCard(project.id), commit, lockAfterEnter);
    },
    [lockAfterEnter],
  );

  /** 浏览器前进重新进入：hash 已由历史栈切换，不再写历史 */
  const openFromHistory = useCallback(
    (project: Project) => {
      if (transitioning.current || currentProject.current) return;
      transitioning.current = true;
      savedScroll.current = window.scrollY;
      const commit = () => {
        currentProject.current = project;
        flushSync(() => setActiveProject(project));
      };
      enterProject(findCard(project.id), commit, lockAfterEnter);
    },
    [lockAfterEnter],
  );

  /** 详情页内切换项目：hero → hero 共享元素转场，replaceState 不新增历史 */
  const switchProject = useCallback(
    (project: Project) => {
      const cur = currentProject.current;
      if (transitioning.current || !cur || cur.id === project.id) return;
      transitioning.current = true;
      // 复用第一阶段进入动效：当前详情主视觉 → 新详情主视觉
      const source = document.querySelector<HTMLElement>('.detail__hero-media');
      const commit = () => {
        currentProject.current = project;
        flushSync(() => setActiveProject(project));
        // 替换当前历史条目而非 push，返回仍回到进入前的列表，前进后退不重复
        if (window.location.hash !== `#project/${project.id}`) {
          window.history.replaceState(
            { wbPort: 'detail', projectId: project.id },
            '',
            `#project/${project.id}`,
          );
        }
      };
      const settle = () => {
        transitioning.current = false;
        reconcileHash();
      };
      enterProject(source, commit, settle);
    },
    [reconcileHash],
  );

  /** 退出转场本身：关闭详情 + 恢复滚动，不改 URL（由调用方管理历史） */
  const performExit = useCallback(() => {
    const project = currentProject.current;
    if (transitioning.current || !project) return;
    transitioning.current = true;
    const commit = () => {
      currentProject.current = null;
      flushSync(() => setActiveProject(null));
      // 在拍新快照前同步解锁并回到进入前的滚动位置，
      // 让目标卡片在新快照里正好处于原位置。
      document.body.classList.remove('detail-lock');
      detailOpen.current = false;
      window.scrollTo({ top: savedScroll.current, behavior: 'instant' as ScrollBehavior });
    };
    const settle = () => {
      transitioning.current = false;
      reconcileHash();
    };
    exitProject(project.id, commit, settle);
  }, [reconcileHash]);

  /** 返回按钮：站内进入走 history.back()（保留前进能力）；直达走 replaceState + 退出 */
  const closeProject = useCallback(() => {
    if (transitioning.current || navPending.current) return;
    const state = window.history.state as { wbPort?: string } | null;
    if (state?.wbPort === 'detail') {
      navPending.current = true;
      window.history.back();
      // 兜底：极端情况下 popstate 未触发，也要解除挂起，避免按钮永久失效
      window.setTimeout(() => { navPending.current = false; }, 900);
    } else {
      // 直接访问 / 刷新进入：没有可回退的站内历史，改当前条目后退出
      window.history.replaceState(
        { wbPort: 'work' },
        '',
        `${window.location.pathname}${window.location.search}#work`,
      );
      // 直达用户没有「进入前」位置，落到作品区顶部更自然，且与 #work 锚点一致不跳动
      const work = document.getElementById('work');
      if (work) {
        savedScroll.current = Math.max(0, work.getBoundingClientRect().top + window.scrollY - 40);
      }
      performExit();
    }
  }, [performExit]);

  // popstate：按 hash 与当前详情状态决定进入 / 退出，均带转场
  useEffect(() => {
    const onPop = () => {
      navPending.current = false;
      if (transitioning.current) return;
      const id = projectIdFromHash();
      const next = id ? PROJECTS.find((p) => p.id === id) ?? null : null;
      const cur = currentProject.current;
      if (next && !cur) {
        openFromHistory(next);
      } else if (!next && cur) {
        performExit();
      } else if (next && cur && next.id !== cur.id) {
        // 详情之间直接跳转（罕见）：无动画直接同步，保证状态正确
        currentProject.current = next;
        flushSync(() => setActiveProject(next));
      }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [openFromHistory, performExit]);

  // Esc 返回：与返回按钮完全同一条路径
  useEffect(() => {
    if (!activeProject) return;
    const onKey = (e: KeyboardEvent) => {
      // 灯箱打开时 ESC 只关闭灯箱（由灯箱自身处理），不连带关闭详情页
      if (e.key === 'Escape' && !document.querySelector('.lightbox')) closeProject();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeProject, closeProject]);

  // 滚动进度条 + DarkVeil 延迟挂载（保持原逻辑不变）
  useEffect(() => {
    let ticking = false;
    const update = () => {
      ticking = false;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
      if (progressRef.current) progressRef.current.style.width = `${pct}%`;

      if (!veilActivated.current && window.scrollY > window.innerHeight * 0.4) {
        veilActivated.current = true;
        setVeilActive(true);
      }
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <>
      <div className="scroll-progress" ref={progressRef} />
      {/* 全屏固定流动背景：头图以不透明背景遮住它，头图以下区块透明透出 */}
      <div className="page-veil" aria-hidden="true">
        {veilActive && (
          <div className="page-veil__canvas">
            <DarkVeil
              color="#6b12ff"
              speed={0.35}
              brightness={1.05}
              sheen={0.55}
              glow={0.55}
              grain={0.035}
              warp={0.15}
              flow={0.85}
              fade={0.35}
              quality={0.5}
            />
          </div>
        )}
        <div className="page-veil__tint" />
      </div>
      <Navbar />
      <main aria-hidden={activeProject ? true : undefined}>
        <Hero />
        <About />
        <Experience />
        <Work onOpen={openProject} />
        <Strengths />
        <Contact />
      </main>
      {activeProject ? (
        <ProjectDetail
          key={activeProject.id}
          project={activeProject}
          projects={PROJECTS}
          onClose={closeProject}
          onSwitch={switchProject}
        />
      ) : null}
    </>
  );
}
