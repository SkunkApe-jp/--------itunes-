import React, { useEffect, useRef, useCallback, useMemo } from "react";
import { ToolMode, AIConfig } from "./types";
import { Toolbar } from "./components/toolbar/Toolbar";
import { GlobalToolbar } from "./components/toolbar/GlobalToolbar";
import { SelectedNodeToolbar } from "./components/toolbar/SelectedNodeToolbar";
import { Canvas } from "./components/Canvas";
import { HUD } from "./components/HUD";
import { SettingsMenu } from "./components/SettingsMenu";
import { WelcomeModal } from "./components/WelcomeModal";
import { ExportModal } from "./components/ExportModal";
import { TabBar } from "./components/tabs/TabBar";
import { FullscreenOverlay } from "./components/FullscreenOverlay";
import { useAppState } from "./hooks/useAppState";
import { useTabs } from "./hooks/useTabs";
import { useTabGraph } from "./hooks/useTabGraph";
import { useTabPersistence } from "./hooks/useTabPersistence";
import { useEventHandlers } from "./hooks/useEventHandlers";
import { useContextMenu } from "./hooks/useContextMenu";
import { useClipboard } from "./hooks/useClipboard";
import { useContextMenuActions } from "./hooks/useContextMenuActions";
import { ContextMenu } from "./components/ContextMenu";
import { useToast } from "./context/ToastContext";
import { configureAI } from "./services/geminiService";
import * as fileHandlers from "./utils/fileHandlers";
import { loadFromDB } from "./utils/db";

function App() {
  const { addToast } = useToast();
  const [isPanDragging, setIsPanDragging] = React.useState(false);
  const [isSelecting, setIsSelecting] = React.useState(false);
  const {
    toolMode,
    setToolMode,
    isSpacePressed,
    setIsSpacePressed,
    isAutoSave,
    setIsAutoSave,
    showGrid,
    setShowGrid,
    snapToGrid,
    setSnapToGrid,
    globalHeaderFont,
    setGlobalHeaderFont,
    globalHeaderFontSize,
    setGlobalHeaderFontSize,
    globalHeaderColor,
    setGlobalHeaderColor,
    globalBodyFont,
    setGlobalBodyFont,
    globalBodyFontSize,
    setGlobalBodyFontSize,
    globalColor,
    setGlobalColor,
    globalCaptionFont,
    setGlobalCaptionFont,
    globalCaptionFontSize,
    setGlobalCaptionFontSize,
    globalCaptionColor,
    setGlobalCaptionColor,
    globalBackgroundColor,
    setGlobalBackgroundColor,
    globalBlur,
    setGlobalBlur,
    globalHeaderGrayLayer,
    setGlobalHeaderGrayLayer,
    isDarkMode,
    setIsDarkMode,
    showStars,
    setShowStars,
    customBackground,
    setCustomBackground,
    lastSaved,
    setLastSaved,
    showSettings,
    setShowSettings,
    showWelcome,
    setShowWelcome,
    aiConfig,
    setAiConfig,
    fullscreenNode,
    setFullscreenNode,
  } = useAppState();

  const [showExportModal, setShowExportModal] = React.useState(false);
  const [showHUD, setShowHUD] = React.useState(true);

  const {
    tabs,
    activeTabId,
    activeTab,
    addTab,
    closeTab,
    switchTab,
    updateTabTitle,
    updateActiveTabData,
    loadTabState,
    reorderTabs,
    getTabState,
  } = useTabs();
  const graph = useTabGraph(activeTab, updateActiveTabData);
  const { contextMenu, showContextMenu, hideContextMenu } = useContextMenu();
  const { copy, paste, canPaste } = useClipboard();
  const [contextMenuNodeType, setContextMenuNodeType] = React.useState<
    "text" | "image" | "title" | "group" | undefined
  >(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeEditorRef = useRef<HTMLTextAreaElement | null>(null);
  const mousePosRef = useRef({ x: 0, y: 0 });
  const fileReaderRef = useRef<FileReader | null>(null);

  const handleShowContextMenu = useCallback(
    (
      e: React.MouseEvent | MouseEvent,
      type: "canvas" | "node" | "connection" | "selection",
      targetId?: string
    ) => {
      let nodeType: "text" | "image" | "title" | "group" | undefined =
        undefined;
      let menuType = type;
      const selectedNodes = graph.nodes.filter((n) => n.selected);

      if (type === "node" && targetId) {
        const node = graph.nodes.find((n) => n.id === targetId);
        if (node) {
          nodeType = node.type;
          if (!node.selected) {
            graph.selectNode(targetId);
          }
        }
      } else if (type === "canvas" && selectedNodes.length > 1) {
        menuType = "selection";
      }

      setContextMenuNodeType(nodeType);
      showContextMenu(e, menuType, targetId);
    },
    [graph, showContextMenu]
  );

  const handleContextMenuAction = useContextMenuActions({
    graph,
    contextMenu,
    hideContextMenu,
    copy,
    paste,
    addToast,
    fileInputRef,
  });

  const { loadData, saveData, markInitialized } = useTabPersistence({
    getTabState,
    loadTabState,
    globalHeaderFont,
    globalHeaderFontSize,
    globalHeaderColor,
    globalBodyFont,
    globalBodyFontSize,
    globalColor,
    globalCaptionFont,
    globalCaptionFontSize,
    globalCaptionColor,
    globalBackgroundColor,
    globalBlur,
    globalHeaderGrayLayer,
    isDarkMode,
    isAutoSave,
    showGrid,
    snapToGrid,
    showStars,
    customBackground,
    toolMode,
    setGlobalHeaderFont,
    setGlobalHeaderFontSize,
    setGlobalHeaderColor,
    setGlobalBodyFont,
    setGlobalBodyFontSize,
    setGlobalColor,
    setGlobalCaptionFont,
    setGlobalCaptionFontSize,
    setGlobalCaptionColor,
    setGlobalBackgroundColor,
    setGlobalBlur,
    setGlobalHeaderGrayLayer,
    setIsDarkMode,
    setIsAutoSave,
    setShowGrid,
    setSnapToGrid,
    setShowStars,
    setCustomBackground,
    setToolMode,
    setLastSaved,
  });

  const handleSaveLocal = useCallback(
    () => fileHandlers.handleSaveLocal(saveData, addToast),
    [saveData, addToast]
  );

  const handleTestAggregation = useCallback(() => {
    const selectedNode = graph.nodes.find(n => n.selected);
    if (!selectedNode) {
      addToast({ title: 'No Selection', message: 'Please select a node to test aggregation', type: 'warning' });
      return;
    }
    
    const sourceNodes = graph.connections
      .filter(c => c.targetId === selectedNode.id)
      .map(c => graph.nodes.find(n => n.id === c.sourceId))
      .filter(Boolean);
    
    if (sourceNodes.length === 0) {
      addToast({ title: 'No Sources', message: 'Selected node has no incoming connections', type: 'warning' });
      return;
    }
    
    if (sourceNodes.length === 1) {
      addToast({ title: 'Single Source', message: 'Node has only 1 incoming connection. Need 2+ for aggregation.', type: 'warning' });
      return;
    }
    
    graph.generateContentForConvergentNode(selectedNode.id);
    addToast({ title: 'Aggregation Started', message: `Aggregating content from ${sourceNodes.length} source nodes`, type: 'success' });
  }, [graph, addToast]);

  useEventHandlers({
    viewport: graph.viewport,
    mousePosRef,
    setIsSpacePressed,
    setToolMode,
    handleSaveLocal,
    addNode: graph.addNode,
    onDeleteSelected: () => {
      const selected = graph.nodes.find((n) => n.selected);
      if (selected) graph.deleteNode(selected.id);
      const selectedConn = graph.connections.find((c) => c.selected);
      if (selectedConn) graph.deleteConnection(selectedConn.id);
    },
  });

  useEffect(() => {
    isDarkMode
      ? document.documentElement.classList.add("dark")
      : document.documentElement.classList.remove("dark");
  }, [isDarkMode]);
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const rect = document
        .querySelector(".canvas-container")
        ?.getBoundingClientRect() || { left: 0, top: 0 };
      mousePosRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const savedConfig = localStorage.getItem("iamtired_ai_config");
    if (savedConfig) {
      try {
        setAiConfig(JSON.parse(savedConfig));
        configureAI(JSON.parse(savedConfig));
      } catch (e) { }
    } else configureAI(aiConfig);
    if (!localStorage.getItem("iamtired_onboarding_complete") && !savedConfig)
      setShowWelcome(true);

    const initStorage = async () => {
      try {
        let data = await loadFromDB("iamtired_save");
        if (!data) {
          const local = localStorage.getItem("iamtired_save");
          if (local) {
            try {
              data = JSON.parse(local);
              console.log("Migrating from LocalStorage to IndexedDB...");
            } catch (e) {
              console.error("Legacy save corrupt", e);
            }
          }
        }
        if (data) {
          loadData(data);
        } else {
          markInitialized();
        }
      } catch (e) {
        console.error("Storage Initialization Error:", e);
        markInitialized();
      }
    };

    initStorage();
  }, []);

  // HUD visibility hotkey (Shift+H)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === 'H') {
        e.preventDefault();
        setShowHUD(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const selectedNode = graph.nodes.find((n) => n.selected);

  const insertMarkdown = (prefix: string, suffix: string = "") => {
    if (activeEditorRef.current && selectedNode) {
      // ... same markdown logic ...
      const ta = activeEditorRef.current;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const text = ta.value;

      let newText = text;
      let newCursorStart = start;
      let newCursorEnd = end;

      if (prefix.includes("---")) {
        const insert = prefix.startsWith("\n") ? prefix : `\n${prefix}\n`;
        newText = text.substring(0, start) + insert + text.substring(end);
        newCursorStart = start + insert.length;
        newCursorEnd = start + insert.length;
        graph.updateNode(selectedNode.id, { content: newText });
        setTimeout(() => {
          ta.focus();
          ta.setSelectionRange(newCursorStart, newCursorEnd);
        }, 0);
        return;
      }

      if (suffix) {
        const selected = text.substring(start, end);
        const before = text.substring(0, start);
        const after = text.substring(end);
        if (selected.startsWith(prefix) && selected.endsWith(suffix)) {
          newText =
            before +
            selected.substring(prefix.length, selected.length - suffix.length) +
            after;
          newCursorStart = start;
          newCursorEnd = end - prefix.length - suffix.length;
        } else if (before.endsWith(prefix) && after.startsWith(suffix)) {
          newText =
            before.substring(0, before.length - prefix.length) +
            selected +
            after.substring(suffix.length);
          newCursorStart = start - prefix.length;
          newCursorEnd = end - prefix.length;
        } else {
          newText = before + prefix + selected + suffix + after;
          newCursorStart = start + prefix.length;
          newCursorEnd = end + prefix.length;
        }
      } else {
        let lineStart = text.lastIndexOf("\n", start - 1) + 1;
        let lineEnd = text.indexOf("\n", end);
        if (lineEnd === -1) lineEnd = text.length;
        const listRegex = /^(\s*(?:#{1,6}|[-*+]|\d+\.|>)\s+)(.*)/;
        const selectionContainsNewline = text
          .substring(start, end)
          .includes("\n");

        if (selectionContainsNewline) {
          let chunkEnd = end;
          if (text[chunkEnd - 1] === "\n") chunkEnd--;
          let lastLineEnd = text.indexOf("\n", chunkEnd);
          if (lastLineEnd === -1) lastLineEnd = text.length;
          const chunk = text.substring(lineStart, lastLineEnd);
          const lines = chunk.split("\n");
          const isNumbered = prefix === "1. ";
          const allHavePrefix = lines.every((line) => {
            if (line.trim().length === 0) return true;
            if (isNumbered) return /^\s*\d+\.\s+/.test(line);
            return line.startsWith(prefix);
          });
          const newLines = lines.map((line, idx) => {
            if (line.trim().length === 0) return line;
            const match = line.match(listRegex);
            const currentContent = match ? match[2] : line;
            if (allHavePrefix) return currentContent;
            else {
              const effectivePrefix = isNumbered ? `${idx + 1}. ` : prefix;
              return effectivePrefix + currentContent;
            }
          });
          const newChunk = newLines.join("\n");
          newText =
            text.substring(0, lineStart) +
            newChunk +
            text.substring(lastLineEnd);
          newCursorStart = lineStart;
          newCursorEnd = lineStart + newChunk.length;
        } else {
          const lineContent = text.substring(lineStart, lineEnd);
          const match = lineContent.match(listRegex);
          if (match) {
            const currentPrefix = match[1];
            const content = match[2];
            const isCurrentNumbered = /^\s*\d+\.\s+$/.test(currentPrefix);
            const isTargetNumbered = prefix === "1. ";
            if (
              currentPrefix === prefix ||
              (isCurrentNumbered && isTargetNumbered)
            ) {
              newText =
                text.substring(0, lineStart) +
                content +
                text.substring(lineEnd);
              newCursorStart = Math.max(lineStart, start - prefix.length);
              newCursorEnd = Math.max(lineStart, end - prefix.length);
            } else if (
              prefix.trim().startsWith("#") &&
              currentPrefix.trim().startsWith("#")
            ) {
              newText =
                text.substring(0, lineStart) +
                prefix +
                content +
                text.substring(lineEnd);
              const diff = prefix.length - currentPrefix.length;
              newCursorStart = Math.max(lineStart, start + diff);
              newCursorEnd = Math.max(lineStart, end + diff);
            } else {
              newText =
                text.substring(0, lineStart) +
                prefix +
                content +
                text.substring(lineEnd);
              const diff = prefix.length - currentPrefix.length;
              newCursorStart = Math.max(lineStart, start + diff);
              newCursorEnd = Math.max(lineStart, end + diff);
            }
          } else {
            newText =
              text.substring(0, lineStart) +
              prefix +
              lineContent +
              text.substring(lineEnd);
            newCursorStart = start + prefix.length;
            newCursorEnd = end + prefix.length;
          }
        }
      }
      graph.updateNode(selectedNode.id, { content: newText });
      setTimeout(() => {
        ta.focus();
        ta.setSelectionRange(newCursorStart, newCursorEnd);
      }, 0);
    }
  };

  const onAddNode = (
    type: any,
    title: string,
    content?: string,
    image?: string
  ) => {
    const centerX =
      (-graph.viewport.x + window.innerWidth / 2) / graph.viewport.scale;
    const centerY =
      (-graph.viewport.y + window.innerHeight / 2) / graph.viewport.scale;
    // When adding new nodes, we let the default behavior take over which uses global settings implicitly if undefined
    graph.addNode(type, title, content, image, {
      x: centerX + (Math.random() - 0.5) * 60,
      y: centerY + (Math.random() - 0.5) * 60,
    });
  };

  const selectedCount = useMemo(() => graph.nodes.filter((n) => n.selected).length, [graph.nodes]);

  const wordCount = useMemo(() => {
    const selectedNodes = graph.nodes.filter((n) => n.selected);
    const nodesToCount = selectedNodes.length > 0 ? selectedNodes : graph.nodes;
    return nodesToCount.reduce((acc, node) => {
      if (node.type === "text")
        return (
          acc + (node.content?.trim().split(/\s+/).filter(Boolean).length || 0)
        );
      else if (node.type === "image")
        return (
          acc + (node.title?.trim().split(/\s+/).filter(Boolean).length || 0)
        );
      return acc;
    }, 0);
  }, [graph.nodes]);

  return (
    <div
      className={`w-full h-full bg-transparent relative overflow-hidden font-sans transition-colors duration-300 flex flex-col`}
    >
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && contextMenu.targetId) {
            // Validate file type and size
            if (!file.type.startsWith('image/')) {
              addToast({
                title: "Invalid File",
                message: "Please select an image file",
                type: "error",
              });
              e.target.value = "";
              return;
            }
            
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
              addToast({
                title: "File Too Large",
                message: "Image files must be smaller than 10MB",
                type: "error",
              });
              e.target.value = "";
              return;
            }

            // Cleanup previous reader if exists
            if (fileReaderRef.current) {
              fileReaderRef.current.abort();
              fileReaderRef.current.onload = null;
              fileReaderRef.current.onerror = null;
            }

            fileReaderRef.current = new FileReader();
            fileReaderRef.current.onload = (ev) => {
              const result = ev.target?.result;
              if (typeof result === 'string' && result.startsWith('data:image/')) {
                graph.updateNode(contextMenu.targetId!, {
                  coverImage: result,
                });
                addToast({
                  title: "Replaced",
                  message: "Image updated",
                  type: "success",
                });
              } else {
                addToast({
                  title: "Upload Failed",
                  message: "Invalid image data",
                  type: "error",
                });
              }
              // Cleanup reader
              fileReaderRef.current = null;
            };
            fileReaderRef.current.onerror = () => {
              addToast({
                title: "Upload Failed",
                message: "Failed to read file",
                type: "error",
              });
              // Cleanup reader
              fileReaderRef.current = null;
            };
            fileReaderRef.current.readAsDataURL(file);
          }
          e.target.value = "";
        }}
      />
      <div
        className={isPanDragging || isSelecting ? "pointer-events-none" : ""}
      >
        {showHUD && (
        <TabBar
          tabs={tabs}
          activeTabId={activeTabId}
          onSwitchTab={switchTab}
          onCloseTab={closeTab}
          onNewTab={addTab}
          onRenameTab={updateTabTitle}
          onReorderTabs={reorderTabs}
          globalFont={globalBodyFont}
        />
        )}
      </div>
      <div className="flex-1 relative overflow-hidden">
        <div
          className={isPanDragging || isSelecting ? "pointer-events-none" : ""}
        >
          {showHUD && (
          <Toolbar
            onAddNode={onAddNode}
            toolMode={isSpacePressed ? ToolMode.PAN : toolMode}
            setToolMode={setToolMode}
            onZoomIn={() =>
              graph.setViewport({
                ...graph.viewport,
                scale: Math.min(3, graph.viewport.scale * 1.2),
              })
            }
            onZoomOut={() =>
              graph.setViewport({
                ...graph.viewport,
                scale: Math.max(0.1, graph.viewport.scale / 1.2),
              })
            }
            isAutoSave={isAutoSave}
            onToggleAutoSave={() => setIsAutoSave(!isAutoSave)}
            onSaveLocal={handleSaveLocal}
            onLoadLocal={() => fileHandlers.handleLoadLocal(loadData, addToast)}
            onExportFile={() => setShowExportModal(true)}
            onImportFile={(e) =>
              fileHandlers.handleImportFile(e, loadData, addToast)
            }
            showGrid={showGrid}
            snapToGrid={snapToGrid}
            onToggleGrid={() => setShowGrid(!showGrid)}
            onToggleSnap={() => setSnapToGrid(!snapToGrid)}
            showStars={showStars}
            onToggleStars={() => setShowStars(!showStars)}
            customBackground={customBackground}
            onSetCustomBackground={setCustomBackground}
            isDarkMode={isDarkMode}
            onToggleTheme={() => setIsDarkMode(!isDarkMode)}
            onOpenSettings={() => setShowSettings(true)}
            onOpenWelcome={() => setShowWelcome(true)}
            onTestAggregation={handleTestAggregation}
          >
            {selectedNode ? (
              <SelectedNodeToolbar
                selectedNode={selectedNode}
                globalFont={globalBodyFont}
                globalColor={globalColor}
                globalBackgroundColor={globalBackgroundColor}
                globalBlur={globalBlur}
                globalHeaderGrayLayer={globalHeaderGrayLayer}
                updateSelectedNodes={graph.updateSelectedNodes}
                insertMarkdown={insertMarkdown}
              />
            ) : (
              <GlobalToolbar
                globalHeaderFont={globalHeaderFont}
                setGlobalHeaderFont={setGlobalHeaderFont}
                globalHeaderFontSize={globalHeaderFontSize}
                setGlobalHeaderFontSize={setGlobalHeaderFontSize}
                globalHeaderColor={globalHeaderColor}
                setGlobalHeaderColor={setGlobalHeaderColor}
                globalBodyFont={globalBodyFont}
                setGlobalBodyFont={setGlobalBodyFont}
                globalBodyFontSize={globalBodyFontSize}
                setGlobalBodyFontSize={setGlobalBodyFontSize}
                globalColor={globalColor}
                setGlobalColor={setGlobalColor}
                globalCaptionFont={globalCaptionFont}
                setGlobalCaptionFont={setGlobalCaptionFont}
                globalCaptionFontSize={globalCaptionFontSize}
                setGlobalCaptionFontSize={setGlobalCaptionFontSize}
                globalCaptionColor={globalCaptionColor}
                setGlobalCaptionColor={setGlobalCaptionColor}
                globalBackgroundColor={globalBackgroundColor}
                setGlobalBackgroundColor={setGlobalBackgroundColor}
                globalBlur={globalBlur}
                setGlobalBlur={setGlobalBlur}
                globalHeaderGrayLayer={globalHeaderGrayLayer}
                setGlobalHeaderGrayLayer={setGlobalHeaderGrayLayer}
              />
            )}
          </Toolbar>
          )}
        </div>
        <Canvas
          nodes={graph.nodes}
          connections={graph.connections}
          viewport={graph.viewport}
          toolMode={isSpacePressed ? ToolMode.PAN : toolMode}
          isSpacePressed={isSpacePressed}
          onViewportChange={graph.setViewport}
          onUpdateNode={graph.updateNode}
          onUpdateNodes={graph.updateNodes}
          onDeleteNode={graph.deleteNode}
          onSelectNode={graph.selectNode}
          onSelectNodes={graph.selectNodes}
          onBranchNode={graph.branchFromNode}
          onConnectEnd={graph.connectNodes}
          onExpandAI={graph.expandNodeAI}
          onEditNodeAI={graph.editNodeAI}
          onSetImage={graph.setNodeImage}
          onSelectConnection={graph.selectConnection}
          onUpdateConnectionLabel={graph.updateConnectionLabel}
          onDeleteConnection={graph.deleteConnection}
          onReparentNode={graph.reparentNode}
          onBackgroundDoubleClick={(pos) =>
            graph.addNode("text", "Untitled", "", undefined, pos)
          }
          onFullscreenNode={(nodeId) => setFullscreenNode(nodeId)}
          registerFormatRef={(ref) => (activeEditorRef.current = ref.current)}
          showGrid={showGrid}
          snapToGrid={snapToGrid}
          showStars={showStars}
          globalFont={globalBodyFont}
          globalHeaderFont={globalHeaderFont}
          globalHeaderFontSize={globalHeaderFontSize}
          globalHeaderColor={globalHeaderColor}
          globalBodyFontSize={globalBodyFontSize}
          globalColor={globalColor}
          globalCaptionFont={globalCaptionFont}
          globalCaptionFontSize={globalCaptionFontSize}
          globalCaptionColor={globalCaptionColor}
          globalBackgroundColor={globalBackgroundColor}
          globalBlur={globalBlur}
          globalHeaderGrayLayer={globalHeaderGrayLayer}
          isDarkMode={isDarkMode}
          onPanDraggingChange={setIsPanDragging}
          onSelectionDraggingChange={setIsSelecting}
          customBackground={customBackground}
          onContextMenu={handleShowContextMenu}
        />
        <div
          className={isPanDragging || isSelecting ? "pointer-events-none" : ""}
        >
          {showHUD && (
          <HUD
            nodeCount={graph.nodes.length}
            connectionCount={graph.connections.length}
            wordCount={wordCount}
            zoomScale={graph.viewport.scale}
            lastSaved={lastSaved}
            globalFont={globalBodyFont}
          />
          )}
        </div>
      </div>
      <div
        className={isPanDragging || isSelecting ? "pointer-events-none" : ""}
      >
        {showSettings && (
          <SettingsMenu
            currentConfig={aiConfig}
            onSave={(c) => {
              setAiConfig(c);
              configureAI(c);
              localStorage.setItem("iamtired_ai_config", JSON.stringify(c));
              localStorage.setItem("iamtired_onboarding_complete", "true");
              addToast({
                title: "Saved",
                message: "Config updated",
                type: "success",
              });
            }}
            onClose={() => setShowSettings(false)}
            globalFont={globalBodyFont}
          />
        )}
        {showWelcome && (
          <WelcomeModal
            onConfigure={() => {
              setShowWelcome(false);
              setShowSettings(true);
            }}
            onContinue={() => {
              setShowWelcome(false);
              localStorage.setItem("iamtired_onboarding_complete", "true");
            }}
            globalFont={globalBodyFont}
          />
        )}
        {showExportModal && (
          <ExportModal
            onClose={() => setShowExportModal(false)}
            onExport={(filename) => {
              fileHandlers.handleExportFile(saveData, filename);
              setShowExportModal(false);
              addToast({
                title: "Exported",
                message: `${filename}.json saved`,
                type: "success",
              });
            }}
          />
        )}
        {contextMenu.visible && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            type={contextMenu.type as 'canvas' | 'node' | 'connection' | 'selection'}
            onClose={hideContextMenu}
            onAction={handleContextMenuAction}
            hasMultiSelection={selectedCount > 1}
            canPaste={canPaste}
            selectedText={contextMenu.selectedText}
            nodeType={contextMenuNodeType}
          />
        )}
        {fullscreenNode && (
          <FullscreenOverlay
            node={graph.nodes.find(n => n.id === fullscreenNode) || null}
            onClose={() => setFullscreenNode(null)}
            customBackground={customBackground}
          />
        )}
      </div>
    </div>
  );
}
export default App;
