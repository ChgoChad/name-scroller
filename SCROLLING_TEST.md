# Scrolling Animation Test Results

## Implementation Details

### Animation Flow:
1. **CSS Animation**: Automatically starts when `.presentation-name` element is rendered
2. **Duration**: Uses `--scroll-duration` variable from config (default: 10s)
3. **Path**: Travels from `100vh` (bottom) to `-100vh` (top)
4. **Opacity**: Fades in at 5%, stays visible, fades out at 95%

### Timing:
- **Animation Duration**: 10 seconds (configurable)
- **New Name Interval**: 5 seconds (50% of animation duration)
- **Logic**: When name reaches top (50% complete), next name starts at bottom

### Multiple Names:
- Max 2-3 names on screen simultaneously depending on animation speed
- Names added to array with unique ID keys
- Automatically removed after animation completes
- React re-renders trigger new animation cycles

### Key Code Points:
- `delayBetweenStarts = animationDuration * 0.5` - Perfect timing for continuous scroll
- `animation: presentation-scroll-up var(--scroll-duration, 10s) linear forwards` - Auto-starts
- Unique `key={id}` for each name ensures React treats them as separate elements

## Expected Behavior:
✓ Names scroll smoothly from bottom to top
✓ New name appears at bottom as previous reaches top  
✓ No gaps or overlaps between names
✓ Continuous scrolling effect maintained
