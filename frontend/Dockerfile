# ベースイメージを指定
FROM node:18.17.1

# 作業ディレクトリを設定
WORKDIR /app/frontend

# プロジェクトの依存関係をコピーしてインストール
COPY package.json package-lock.json ./
RUN npm install

# ソースコードをコピー
COPY . .

# ビルド
RUN npm run build

# ポートを公開 (Reactアプリ用)
EXPOSE 3000

# アプリケーションの起動コマンド
CMD ["npm", "start"]
