
import { useState, useCallback, useEffect, useRef } from 'react';
import { WikiNode, Connection, Viewport, HandlePosition, Position } from '../types';
import { Tab } from '../types/tabTypes';
import { getAbsolutePosition } from '../utils/nodeUtils';
import { useGraphGrouping } from './graph/useGraphGrouping';
import { useGraphAI } from './graph/useGraphAI';

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useTabGraph = (activeTab: Tab, onUpdateTabData: (nodes: WikiNode[], connections: Connection[], viewport: Viewport) => void) => {
    const [nodes, setNodes] = useState<WikiNode[]>(activeTab.nodes);
    const [connections, setConnections] = useState<Connection[]>(activeTab.connections);
    const [viewport, setViewport] = useState<Viewport>(activeTab.viewport);
    const prevTabIdRef = useRef(activeTab.id);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Sync state when active tab changes
    useEffect(() => {
        if (activeTab.id !== prevTabIdRef.current) {
            setNodes(activeTab.nodes);
            setConnections(activeTab.connections);
            setViewport(activeTab.viewport);
            prevTabIdRef.current = activeTab.id;
        }
    }, [activeTab]);

    // Sync changes back to tab state
    useEffect(() => {
        // Clear any existing timeout
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        
        saveTimeoutRef.current = setTimeout(() => {
            // Only save if we're still on the same tab and the tab hasn't been destroyed
            if (activeTab.id === prevTabIdRef.current && activeTab.id) {
                onUpdateTabData(nodes, connections, viewport);
            }
            saveTimeoutRef.current = null;
        }, 50);
        
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
                saveTimeoutRef.current = null;
            }
        };
    }, [nodes, connections, viewport, onUpdateTabData, activeTab.id]);

    const getNextZIndex = useCallback(() => nodes.length === 0 ? 1 : Math.max(...nodes.map(n => n.zIndex || 0)) + 1, [nodes]);

    // Update helpers
    const updateNode = useCallback((id: string, updates: Partial<WikiNode>) => {
        setNodes(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n));
    }, []);

    const connectNodes = useCallback((sourceId: string, targetId: string, sourceHandle: HandlePosition, targetHandle: HandlePosition) => {
        if (sourceId === targetId) return;
        setConnections(prev => {
            // Check for exact duplicate
            const exactDuplicate = prev.find(c => 
                c.sourceId === sourceId && c.targetId === targetId && 
                c.sourceHandle === sourceHandle && c.targetHandle === targetHandle
            );
            if (exactDuplicate) return prev;
            
            // Check for reverse duplicate (opposite direction with appropriate handles)
            const reverseDuplicate = prev.find(c => 
                c.sourceId === targetId && c.targetId === sourceId &&
                c.sourceHandle === targetHandle && c.targetHandle === sourceHandle
            );
            if (reverseDuplicate) return prev;
            
            return [...prev, { id: generateId(), sourceId, targetId, sourceHandle, targetHandle, label: '' }];
        });
    }, []);

    // Modular Hooks
    const { groupNodes, ungroupNodes, reparentNode } = useGraphGrouping({ nodes, setNodes, generateId, getNextZIndex });
    const { setNodeImage, expandNodeAI, editNodeAI, branchFromNode, generateContentForConvergentNode, generateTitleFromContent } = useGraphAI({ nodes, setNodes, updateNode, connectNodes, generateId, getNextZIndex, connections });

    // Node & Connection CRUD
    const moveToFront = useCallback((nodeId: string) => {
        setNodes(prev => {
            const nextZ = Math.max(...prev.map(n => n.zIndex || 0)) + 1;
            return prev.map(n => n.id === nodeId ? { ...n, zIndex: nextZ } : n);
        });
    }, []);

    const addNode = useCallback((type: 'text' | 'image' | 'title' | 'group', title: string, content?: string, image?: string, pos?: Position) => {
        let width = 350, height = 300;
        let defaultZ = 2;

        if (type === 'text') { /* Standard text size */ }
        else if (type === 'image') { width = 300; height = 300; defaultZ = 3; }
        else if (type === 'title') { width = 400; height = 80; defaultZ = 4; }
        else if (type === 'group') { width = 500; height = 400; defaultZ = 1; }

        /**
         * VISUAL DESIGN POLICY:
         * Left undefined to inherit from Global Settings by default.
         */
        const newNode: WikiNode = {
            id: generateId(), type, title, content: content || '', coverImage: image,
            position: pos || { x: 0, y: 0 }, width, height,
            imageHeight: 160, imageFit: 'contain', isGenerating: false, zIndex: defaultZ,
        };
        setNodes(prev => [...prev, newNode]);
    }, []);

    const updateNodes = useCallback((updates: { id: string, updates: Partial<WikiNode> }[]) => {
        setNodes(prev => prev.map(n => {
            const update = updates.find(u => u.id === n.id);
            return update ? { ...n, ...update.updates } : n;
        }));
    }, []);

    const updateSelectedNodes = useCallback((updates: Partial<WikiNode>) => {
        setNodes(prev => prev.map(n => n.selected ? { ...n, ...updates } : n));
    }, []);

    const deleteNode = useCallback((id: string) => {
        setNodes(prevNodes => {
            const nodesToDelete = new Set<string>();
            const collectIds = (targetId: string) => {
                nodesToDelete.add(targetId);
                prevNodes.filter(n => n.parentId === targetId).forEach(child => collectIds(child.id));
            };
            collectIds(id);
            setConnections(prevConns => prevConns.filter(c => !nodesToDelete.has(c.sourceId) && !nodesToDelete.has(c.targetId)));
            return prevNodes.filter(n => !nodesToDelete.has(n.id));
        });
    }, []);

    const selectNode = useCallback((id: string | null) => {
        setNodes(prev => {
            const selectedCount = prev.filter(n => n.selected).length;
            if (selectedCount > 1 && id !== null && id !== '') return prev; 
            return prev.map(n => ({ ...n, selected: n.id === id }));
        });
        setConnections(prev => prev.map(c => ({ ...c, selected: false })));
    }, []);

    const selectNodes = useCallback((ids: string[]) => {
        setNodes(prev => prev.map(n => ({ ...n, selected: ids.includes(n.id) })));
        setConnections(prev => prev.map(c => ({ ...c, selected: false })));
    }, []);

    const updateConnection = useCallback((id: string, updates: Partial<Connection>) => {
        setConnections(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    }, []);

    const updateConnectionLabel = useCallback((id: string, label: string) => {
        setConnections(prev => prev.map(c => c.id === id ? { ...c, label, isEditing: false } : c));
    }, []);

    const deleteConnection = useCallback((id: string) => {
        setConnections(prev => prev.filter(c => c.id !== id));
    }, []);

    const selectConnection = useCallback((id: string | null) => {
        setConnections(prev => prev.map(c => ({ ...c, selected: c.id === id, isEditing: false })));
        setNodes(prev => {
            const selectedCount = prev.filter(n => n.selected).length;
            if (selectedCount > 1 && id !== null && id !== '') return prev;
            return prev.map(n => ({ ...n, selected: false }));
        });
    }, []);

    const loadGraph = useCallback((newNodes: WikiNode[], newConnections: Connection[]) => {
        setNodes(newNodes); setConnections(newConnections);
    }, []);

    return {
        nodes, setNodes, connections, setConnections, viewport, setViewport,
        addNode, updateNode, updateNodes, updateSelectedNodes, deleteNode, selectNode, selectNodes, 
        groupNodes, ungroupNodes, reparentNode,
        branchFromNode, expandNodeAI, editNodeAI, setNodeImage, generateContentForConvergentNode, generateTitleFromContent,
        connectNodes, updateConnection, updateConnectionLabel, deleteConnection, selectConnection, loadGraph, generateId
    };
};
