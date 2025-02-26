import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { AzureOpenAI } from 'openai';
import { fileURLToPath } from 'url';

dotenv.config();

// 入力ファイルのパス
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FILE_FONT_PATH = path.join(__dirname, 'input_files', 'Font.zip');

// 環境変数から設定を取得
const apiEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
const apiKey = process.env.AZURE_OPENAI_API_KEY;
const apiVersion = process.env.API_VERSION;
const deploymentName = process.env.DEPLOYMENT_NAME;
let assistantId = process.env.ASSISTANT_ID;
let fileFontId = process.env.FONT_FILE_ID;

///////////////////////////////////
// アシスタント削除
///////////////////////////////////
async function removeAssistants(client) {
  let boolCreateAssistant = true;
  try {
    const assistantsResponse = await client.beta.assistants.list();
    for (const assistant of assistantsResponse.data) {
      if (assistant.id === assistantId) {
        console.log(`Excel Assistant found. [Assistant ID: ${assistant.id}] No need to create a new assistant.`);
        boolCreateAssistant = false;
        continue;
      }
      await client.beta.assistants.del(assistant.id);
      console.log(`DELETE: true, Assistant ID: ${assistant.id}`);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
  return boolCreateAssistant;
}

///////////////////////////////////
// ファイル削除
///////////////////////////////////
async function removeFiles(client) {
  let boolUploadFont = true;
  try {
    const filesResponse = await client.files.list();
    for (const file of filesResponse.data) {
      if (file.id === fileFontId) {
        console.log(`Font File found. [File ID: ${file.id}] No need to upload a new font file.`);
        boolUploadFont = false;
        continue;
      }
      const resp = await client.files.del(file.id);
      console.log(`DELETE: ${resp.deleted}, File ID: ${file.id}, File Name: ${file.filename}, File Purpose: ${file.purpose}`);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
  return boolUploadFont;
}

///////////////////////////////////
// Font ファイルアップロード
///////////////////////////////////
async function uploadFont(client) {
  // Font.zip ファイルをアップロード
  const fileStream = fs.createReadStream(FILE_FONT_PATH);
  const file = await client.files.create({
    file: fileStream,
    purpose: "assistants",
  });
  fileStream.close();
  fileFontId = file.id;
  console.log(`Font file uploaded successfully. File ID: ${fileFontId}`);
}

///////////////////////////////////
// アシスタントセットアップ
///////////////////////////////////
async function createAssistant(client) {
  // アシスタントを作成
  const assistant = await client.beta.assistants.create({
    name: 'AI Assistant for Excel File Analysis',
    model: deploymentName,
    instructions: "You are an AI assistant that analyzes EXCEL files. Please answer user requests in Japanese.",
    tools: [{ type: 'code_interpreter' }],
    tool_resources: { code_interpreter: { file_ids: [fileFontId] } },
  });
  assistantId = assistant.id;
  console.log(`Assistant created successfully. Assistant ID: ${assistantId}`);
}

///////////////////////////////////
// メイン関数
///////////////////////////////////
async function main() {
  try {
    // Azure OpenAI クライアントの作成
    const client = new AzureOpenAI({
      apiKey: apiKey,
      apiVersion: apiVersion,
      azureEndpoint: apiEndpoint,
    });

    // 不要な残存ファイルの削除
    const boolUploadFont = await removeFiles(client);

    // FONT ファイルがない場合は、新規にアップロード
    if (boolUploadFont)
      await uploadFont(client);

    // 不要な残存アシスタントの削除
    const boolCreateAssistant = await removeAssistants(client);

    // EXCEL アシスタントがない場合は、新規に作成
    if (boolCreateAssistant)
      await createAssistant(client);

  } catch (e) {
    console.error(`An error occurred: ${e}`);
  }
}

main();