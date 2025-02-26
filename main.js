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

///////////////////////////////////
// アシスタント削除
///////////////////////////////////
async function removeAssistants(client) {
  try {
    const assistantsResponse = await client.beta.assistants.list();
    for (const assistant of assistantsResponse.data) {
      await client.beta.assistants.del(assistant.id);
      console.log(`Assistant deleted successfully. Assistant ID: ${assistant.id}`);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

///////////////////////////////////
// ファイル削除
///////////////////////////////////
async function removeFiles(client) {
  try {
    const filesResponse = await client.files.list();
    for (const file of filesResponse.data) {
      const resp = await client.files.del(file.id);
      console.log(`DELETE: ${resp.deleted}, File ID: ${file.id}, File Name: ${file.filename}, File Purpose: ${file.purpose}`);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

///////////////////////////////////
// アシスタントセットアップ
///////////////////////////////////
async function setupAssistant(client) {

  // Font.zip ファイルをアップロード
  const fileStream = fs.createReadStream(FILE_FONT_PATH);
  const file = await client.files.create({
    file: fileStream,
    purpose: "assistants",
  });
  fileStream.close();
  console.log(`Font file uploaded successfully. File ID: ${file.id}`);

  // アシスタントを作成
  const assistant = await client.beta.assistants.create({
    name: 'AI Assistant for Excel File Analysis',
    model: deploymentName,
    instructions: "You are an AI assistant that analyzes EXCEL files. Please answer user requests in Japanese.",
    tools: [{ type: 'code_interpreter' }],
    tool_resources: { code_interpreter: { file_ids: [file.id] } },
  });
  console.log(`Assistant created successfully. Assistant ID: ${assistant.id}`);
  return assistant.id;
}

///////////////////////////////////
// メイン関数
///////////////////////////////////
async function main() {
  try {
    const client = new AzureOpenAI({
      apiKey: apiKey,
      apiVersion: apiVersion,
      azureEndpoint: apiEndpoint,
    });

    // アシスタントの削除
    await removeAssistants(client);
    // ファイルの削除
    await removeFiles(client);
    // アシスタントのセットアップ
    await setupAssistant(client);

  } catch (e) {
    console.error(`An error occurred: ${e}`);
  }
}

main();