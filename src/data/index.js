import { N5_vocab, N5_verbs, N5_iadj, N5_adj, N5_adv, N5_kata, N5_grammar, N5_particles } from './n5.js'
import { N4_vocab, N4_verbs, N4_iadj, N4_adj, N4_adv, N4_kata, N4_grammar, N4_particles } from './n4.js'

export const CATEGORIES = {
  vocab:     { name: 'Vocabulary',    icon: '📖', color: '#1d9e75', light: '#9fe1cb' },
  verbs:     { name: 'Verbs',         icon: '🏃', color: '#ef9f27', light: '#fac775' },
  iadj:      { name: 'い-Adjectives', icon: '✦',  color: '#d4537e', light: '#f4c0d1' },
  adj:       { name: 'な-Adjectives', icon: '✨',  color: '#d85a30', light: '#f0997b' },
  adv:       { name: 'Adverbs',       icon: '💨', color: '#7f77dd', light: '#afa9ec' },
  kata:      { name: 'Katakana',      icon: 'カ',  color: '#ba7517', light: '#fac775' },
  grammar:   { name: 'Grammar',       icon: '文',  color: '#993556', light: '#f4c0d1' },
  particles: { name: 'Particles',     icon: 'は',  color: '#0f6e56', light: '#5dcaa5' },
}

const DATA = {
  N5: { vocab: N5_vocab, verbs: N5_verbs, iadj: N5_iadj, adj: N5_adj, adv: N5_adv, kata: N5_kata, grammar: N5_grammar, particles: N5_particles },
  N4: { vocab: N4_vocab, verbs: N4_verbs, iadj: N4_iadj, adj: N4_adj, adv: N4_adv, kata: N4_kata, grammar: N4_grammar, particles: N4_particles },
}

export function getCatData(level, cat) {
  return DATA[level]?.[cat] ?? []
}

export const SENTENCES = {
  vocab: [
    { ja: '今日は天気がいいですね。', reading: 'きょうはてんきがいいですね。', en: "The weather is nice today, isn't it?" },
    { ja: '駅はどこですか？', reading: 'えきはどこですか？', en: 'Where is the station?' },
    { ja: '友達と映画を見ました。', reading: 'ともだちとえいがをみました。', en: 'I watched a movie with a friend.' },
    { ja: '毎朝、お茶を飲みます。', reading: 'まいあさ、おちゃをのみます。', en: 'I drink tea every morning.' },
    { ja: '最近、仕事がとても忙しいです。', reading: 'さいきん、しごとがとてもいそがしいです。', en: 'Lately, work has been very busy.' },
  ],
  verbs: [
    { ja: '毎日、日本語を勉強します。', reading: 'まいにち、にほんごをべんきょうします。', en: 'I study Japanese every day.' },
    { ja: '昨日、友達に会いました。', reading: 'きのう、ともだちにあいました。', en: 'I met a friend yesterday.' },
    { ja: '本を読んでいます。', reading: 'ほんをよんでいます。', en: 'I am reading a book.' },
    { ja: '電車に乗って学校に行きます。', reading: 'でんしゃにのってがっこうにいきます。', en: 'I take the train to school.' },
    { ja: '食べた後で、歯を磨きます。', reading: 'たべたあとで、はをみがきます。', en: 'After eating, I brush my teeth.' },
  ],
  iadj: [
    { ja: 'この映画はとても面白かったです。', reading: 'このえいがはとてもおもしろかったです。', en: 'This movie was very interesting.' },
    { ja: '外は寒いから、コートを着てください。', reading: 'そとはさむいから、コートをきてください。', en: "It's cold outside, so please wear a coat." },
    { ja: '素晴らしい演奏でした！', reading: 'すばらしいえんそうでした！', en: 'It was a wonderful performance!' },
    { ja: '彼女はいつも優しいです。', reading: 'かのじょはいつもやさしいです。', en: 'She is always kind.' },
  ],
  adj: [
    { ja: 'この部屋は静かです。', reading: 'このへやはしずかです。', en: 'This room is quiet.' },
    { ja: '今日は暇ですか？', reading: 'きょうはひまですか？', en: 'Are you free today?' },
    { ja: '彼は有名な先生です。', reading: 'かれはゆうめいなせんせいです。', en: 'He is a famous teacher.' },
    { ja: '安全な場所で遊んでください。', reading: 'あんぜんなばしょであそんでください。', en: 'Please play in a safe place.' },
  ],
  adv: [
    { ja: 'ゆっくり話してください。', reading: 'ゆっくりはなしてください。', en: 'Please speak slowly.' },
    { ja: 'いつも早く起きます。', reading: 'いつもはやくおきます。', en: 'I always wake up early.' },
    { ja: 'ちょっと待ってください。', reading: 'ちょっとまってください。', en: 'Please wait a moment.' },
    { ja: '特に数学が好きです。', reading: 'とくにすうがくがすきです。', en: 'I especially like mathematics.' },
  ],
  grammar: [
    { ja: '明日、友達と映画を見るつもりです。', reading: 'あした、ともだちとえいがをみるつもりです。', en: 'I plan to watch a movie with a friend tomorrow.' },
    { ja: '雨が降っているので、傘を持って行きます。', reading: 'あめがふっているので、かさをもっていきます。', en: "Because it's raining, I'll take an umbrella." },
    { ja: 'ここで食べてはいけません。', reading: 'ここでたべてはいけません。', en: 'You must not eat here.' },
    { ja: '日本語が話せるようになりたいです。', reading: 'にほんごがはなせるようになりたいです。', en: 'I want to reach the point where I can speak Japanese.' },
  ],
  particles: [
    { ja: '私は学生です。', reading: 'わたしはがくせいです。', en: 'I am a student.' },
    { ja: '学校まで歩いて行きます。', reading: 'がっこうまであるいていきます。', en: 'I walk all the way to school.' },
    { ja: '東京に住んでいます。', reading: 'とうきょうにすんでいます。', en: 'I live in Tokyo.' },
    { ja: '雨でも試合があります。', reading: 'あめでもしあいがあります。', en: "There's a match even if it rains." },
  ],
  kata: [
    { ja: 'コーヒーを一杯飲みました。', reading: 'コーヒーをいっぱいのみました。', en: 'I drank a cup of coffee.' },
    { ja: 'ホテルに泊まりたいです。', reading: 'ホテルにとまりたいです。', en: 'I want to stay at a hotel.' },
    { ja: 'テレビでニュースを見ます。', reading: 'テレビでニュースをみます。', en: 'I watch the news on TV.' },
  ],
}
