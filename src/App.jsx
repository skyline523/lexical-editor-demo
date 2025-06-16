import Editor from "./Editor"
import './App.css'

const html = `
  <p class="editor-paragraph" dir="ltr"><span style="white-space: pre-wrap;">The playground is a demo environment built with </span><code spellcheck="false" style="white-space: pre-wrap;"><span class="editor-text-code">@lexical/react</span></code><span style="white-space: pre-wrap;">. Try typing in </span><b><strong class="editor-text-bold" style="white-space: pre-wrap;">some text</strong></b><span style="white-space: pre-wrap;"> with </span><i><em class="editor-text-italic" style="white-space: pre-wrap;">different</em></i><span style="white-space: pre-wrap;"> formats.</span></p><p class="editor-paragraph" dir="ltr"><span style="white-space: pre-wrap;">Make sure to check out the various plugins in the toolbar. You can also use #hashtags or @-mentions too!</span></p><p class="editor-paragraph" dir="ltr"><span style="white-space: pre-wrap;">If you'd like to find out more about Lexical, you can:</span></p><ul class="editor-list-ul"><li value="1" class="editor-listitem" dir="ltr"><span style="white-space: pre-wrap;">Visit the </span><a href="https://lexical.dev/" class="editor-link" dir="ltr"><span style="white-space: pre-wrap;">Lexical website</span></a><span style="white-space: pre-wrap;"> for documentation and more information.</span></li><li value="2" class="editor-listitem" dir="ltr"><span style="white-space: pre-wrap;">Check out the code on our </span><a href="https://github.com/facebook/lexical" class="editor-link" dir="ltr"><span style="white-space: pre-wrap;">GitHub repository</span></a><span style="white-space: pre-wrap;">.</span></li><li value="3" class="editor-listitem" dir="ltr"><span style="white-space: pre-wrap;">Playground code can be found </span><a href="https://github.com/facebook/lexical/tree/main/packages/lexical-playground" class="editor-link" dir="ltr"><span style="white-space: pre-wrap;">here</span></a><span style="white-space: pre-wrap;">.</span></li><li value="4" class="editor-listitem" dir="ltr"><span style="white-space: pre-wrap;">Join our </span><a href="https://discord.com/invite/KmG4wQnnD9" class="editor-link" dir="ltr"><span style="white-space: pre-wrap;">Discord Server</span></a><span style="white-space: pre-wrap;"> and chat with the team.</span></li></ul><p class="editor-paragraph" dir="ltr"><span style="white-space: pre-wrap;">Lastly, we're constantly adding cool new features to this playground. So make sure you check back here when you next get a chance 🙂.</span></p>
`

function App() {
  return (
    <div style={{ margin: 20, display: 'flex', justifyContent: 'center' }}>
      <Editor
        value={html}
        disabled={false}
        height={'auto'}
        onChange={(value) => {
          // console.log(value)
        }}
      />
    </div>
  )
}

export default App
