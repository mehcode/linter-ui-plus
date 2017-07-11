# Linter-UI-Plus
> An experiment into an enhanced UI for the Atom Linter package.

#### This is an _alpha_ release. Not all features are available (yet) that are in `linter-ui-default` and those that are present are subject to change. Please open issues with any feedback you have.

## Panel

![](https://user-images.githubusercontent.com/753919/28002478-686f307e-64ea-11e7-83c7-b41a2ef130c8.png)
 
 - Use `linter-ui-plus:toggle-panel` (`alt-shift-d`) will toggle the panel
 - Single click selects message on panel (and opens file in a preview tab) and leaves focus in the panel
 - Double click or `linter-ui-plus:open-selected-entry` (`enter`) on a selected message will focus the file 
 - Use `core:move-up` (`up`) and `core:move-down` (`down`) to move to the next or previous message while in the panel
 
## Editor

![](https://user-images.githubusercontent.com/753919/28002548-05159f94-64eb-11e7-97b4-9ce23d8f0cda.png)

 - An extra gutter is added that will show an error, warning, or info glyph
 - The source of the message will be highlighted in the editor with a red (error), yellow (warning), or blue (info) wavy line
