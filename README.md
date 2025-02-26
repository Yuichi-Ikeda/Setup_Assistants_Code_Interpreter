# Setup Assistants for Code Interpreter (NodeJS)

このプロジェクトでは、OpenAI Assistants Code Interpreter で日本語のグラフを作成するためのアシスタントをセットアップします。日本語フォントを ZIP 形式でアップロードしアシスタントに紐づけます。

## 注意点

本プログラムでは初期化処理として、該当モデルで過去に生成されたアシスタントとデータファイルを`全て削除`した後に新規にセットアップをします。クリーンアップ処理が不要な場合、もしくは残しておきたいアシスタントやデータファイルがある場合は適切な除外処理を組み込んでください。

## 検証環境

2025年2月時点で Assistants API はプレビュー機能であり、[サポートされているモデルとリージョン](https://learn.microsoft.com/ja-jp/azure/ai-services/openai/concepts/models?tabs=global-standard%2Cstandard-chat-completions#assistants-preview)が限られています。本検証では、以下の環境を利用しています。

- リージョン (Glbal Standard) : `westus`
- GPT-4o モデル バージョン : `2024-05-13`
- API_VERSION : `2024-05-01-preview`

## セットアップ

1. `package.json` で指定されているモジュールをインストールします。

    ```sh
    npm install
    ```

2. 必要な環境変数を設定します。VSCode からデバッグ実行をする場合は、拡張機能を利用し .env ファイルに設定を記述してください。

    ```plaintext
    AZURE_OPENAI_ENDPOINT="https://your-openai-endpoint"
    AZURE_OPENAI_API_KEY="your-api-key"
    API_VERSION="2024-05-01-preview"
    DEPLOYMENT_NAME="your-deployment-name"
    ```

## 使用方法

1. スクリプトを実行します。

    ```sh
    node main.js
    ```

2. デバッグ実行

    VSCode からデバッグ実行する場合は、`.vscode/launch.json` ファイルが用意されています。`F5` キーを押してデバッグ実行を行うことができます。

## 参考資料

- [クイック スタート: Azure OpenAI Assistants (プレビュー) の使用を開始する](https://learn.microsoft.com/ja-jp/azure/ai-services/openai/assistants-quickstart?pivots=programming-language-javascript)

- [Assistants Code Interpreter](https://platform.openai.com/docs/assistants/tools/code-interpreter?lang=node.js)