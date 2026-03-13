<div align="center">

<img src="icon.png" alt="iamtired icon" width="120" height="120" />

</div>

---

## Changelog

### v1.2 - Event Handler Updates (Mar 2025)
- **Key Handlers**: Temporarily commented out delete key handlers for stability
- **Event System**: Improved useEventHandlers.ts for better user interaction

### v1.3 - Enhanced UI Components (Mar 2025)
- **Canvas System**: Enhanced Canvas.tsx with improved rendering
- **Visual Effects**: Added HUDStars.tsx and StarsBackground.tsx components with animated star fields
- **Node System**: Improved WikiNode.tsx with 180+ lines of enhancements
- **Connection Layer**: Enhanced ConnectionLayer.tsx with 51 new features
- **Grid System**: Improved gridUtils.ts with 26 enhancements
- **Styling**: Enhanced index.css with 40+ styling improvements
- **Background Effects**: Multi-layer animated star backgrounds with parallax effects
- **Zap Icon Functions**: Added Zap icon for fast performance indicator and content aggregation testing

### v1.4 - Content & AI Features (Mar 2025)
- **Content Aggregation**: Multi-source node synthesis capability
- **AI Title Generation**: Generate titles from node content via context menu
- **Hotkeys**: Shift+H for complete HUD hiding
- **Visual Design**: Upgraded arrowheads to Figma-style smooth design
- **Performance**: Added performance optimization utilities
- **Toolbar**: Test aggregation button added

### v1.5 - Connection System Overhaul (Mar 2025)
- **Visual Design**: Replaced curved bezier paths with clean straight lines
- **Connection Markers**: Removed directional arrowheads, use simple circular dots
- **Professional Appearance**: Eliminated auto-bending behavior
- **Performance**: Simplified marker system with single dot endpoint
- **Code Cleanup**: Removed unused directional logic

### v1.6 - Critical Bug Fixes (Mar 2025)
- **Memory Management**: Fixed memory leaks in useTabGraph timeout cleanup with proper ref management
- **Connection Validation**: Improved validation logic to check for null/undefined positions
- **Resource Management**: Enhanced file reader resource management with proper cleanup
- **Type Safety**: Replaced unsafe type assertions with specific type casting
- **Dependencies**: Added missing addToast dependency to useGraphAI useCallback

### v1.7+ - Latest Updates (Mar 2025)
- **Native Desktop App**: Full Electron desktop application with portable distribution
- **UI Enhancements**: Clean interface without menu bar distraction
- **Build System**: Improved packaging with electron-packager for better portability
- **Bug Fixes**: 
  - Fixed memory leaks and resource management
  - Improved connection validation system
  - Enhanced straight-line connections with dots
- **New Features**:
  - Content aggregation capabilities
  - Automatic title generation
  - Enhanced UI components