import test from 'ava'
import Telegraf from 'telegraf'

import TelegrafInlineMenu from '../inline-menu'
import {emojiTrue, emojiFalse} from '../prefix'

test('option array menu', async t => {
  const menu = new TelegrafInlineMenu('foo')
  menu.select('c', ['a', 'b'], {
    setFunc: t.fail
  })

  const bot = new Telegraf()
  bot.use(menu.init({actionCode: 'a:b'}))

  bot.context.editMessageText = (text, extra) => {
    t.deepEqual(extra.reply_markup.inline_keyboard, [[
      {
        text: 'a',
        hide: false,
        callback_data: 'a:b:c:a'
      }, {
        text: 'b',
        hide: false,
        callback_data: 'a:b:c:b'
      }
    ]])
    return Promise.resolve()
  }

  await bot.handleUpdate({callback_query: {data: 'a:b'}})
})

test('option object menu', async t => {
  const menu = new TelegrafInlineMenu('foo')
  menu.select('c', {a: 'A', b: 'B'}, {
    setFunc: t.fail
  })

  const bot = new Telegraf()
  bot.use(menu.init({actionCode: 'a:b'}))

  bot.context.editMessageText = (text, extra) => {
    t.deepEqual(extra.reply_markup.inline_keyboard, [[
      {
        text: 'A',
        hide: false,
        callback_data: 'a:b:c:a'
      }, {
        text: 'B',
        hide: false,
        callback_data: 'a:b:c:b'
      }
    ]])
    return Promise.resolve()
  }

  await bot.handleUpdate({callback_query: {data: 'a:b'}})
})

test('option async array menu', async t => {
  const menu = new TelegrafInlineMenu('foo')
  menu.select('c', () => Promise.resolve(['a', 'b']), {
    setFunc: t.fail
  })

  const bot = new Telegraf()
  bot.use(menu.init({actionCode: 'a:b'}))

  bot.context.editMessageText = (text, extra) => {
    t.deepEqual(extra.reply_markup.inline_keyboard, [[
      {
        text: 'a',
        hide: false,
        callback_data: 'a:b:c:a'
      }, {
        text: 'b',
        hide: false,
        callback_data: 'a:b:c:b'
      }
    ]])
    return Promise.resolve()
  }

  await bot.handleUpdate({callback_query: {data: 'a:b'}})
})

test('selects', async t => {
  t.plan(2)
  const menu = new TelegrafInlineMenu('foo')
  menu.select('c', ['a', 'b'], {
    setFunc: (ctx, selected) => t.is(selected, 'b')
  })

  const bot = new Telegraf()
  bot.use(menu.init({actionCode: 'a:b'}))

  bot.context.editMessageText = () => Promise.resolve(t.pass())

  await bot.handleUpdate({callback_query: {data: 'a:b:c:b'}})
})

test('selected key has emoji prefix', async t => {
  const menu = new TelegrafInlineMenu('foo')
  menu.select('c', ['a', 'b'], {
    setFunc: t.fail,
    isSetFunc: (ctx, key) => Promise.resolve(key === 'b')
  })

  const bot = new Telegraf()
  bot.use(menu.init({actionCode: 'a:b'}))

  bot.context.editMessageText = (text, extra) => {
    t.deepEqual(extra.reply_markup.inline_keyboard, [[
      {
        text: 'a',
        hide: false,
        callback_data: 'a:b:c:a'
      }, {
        text: emojiTrue + ' b',
        hide: false,
        callback_data: 'a:b:c:b'
      }
    ]])
    return Promise.resolve()
  }

  await bot.handleUpdate({callback_query: {data: 'a:b'}})
})

test('multiselect has prefixes', async t => {
  const menu = new TelegrafInlineMenu('foo')
  menu.select('c', ['a', 'b'], {
    multiselect: true,
    setFunc: t.fail,
    isSetFunc: (ctx, key) => Promise.resolve(key === 'b')
  })

  const bot = new Telegraf()
  bot.use(menu.init({actionCode: 'a:b'}))

  bot.context.editMessageText = (text, extra) => {
    t.deepEqual(extra.reply_markup.inline_keyboard, [[
      {
        text: emojiFalse + ' a',
        hide: false,
        callback_data: 'a:b:c:a'
      }, {
        text: emojiTrue + ' b',
        hide: false,
        callback_data: 'a:b:c:b'
      }
    ]])
    return Promise.resolve()
  }

  await bot.handleUpdate({callback_query: {data: 'a:b'}})
})

test('custom prefix', async t => {
  const menu = new TelegrafInlineMenu('foo')
  menu.select('c', ['a', 'b'], {
    setFunc: t.fail,
    prefixFunc: () => Promise.resolve('bar')
  })

  const bot = new Telegraf()
  bot.use(menu.init({actionCode: 'a:b'}))

  bot.context.editMessageText = (text, extra) => {
    t.deepEqual(extra.reply_markup.inline_keyboard, [[
      {
        text: 'bar a',
        hide: false,
        callback_data: 'a:b:c:a'
      }, {
        text: 'bar b',
        hide: false,
        callback_data: 'a:b:c:b'
      }
    ]])
    return Promise.resolve()
  }

  await bot.handleUpdate({callback_query: {data: 'a:b'}})
})

test('hides key in keyboard', async t => {
  t.plan(1)
  const menu = new TelegrafInlineMenu('foo')
  menu.select('c', ['a', 'b'], {
    setFunc: t.fail,
    hide: (ctx, key) => key === 'a'
  })

  const bot = new Telegraf()
  bot.use(menu.init({actionCode: 'a:b'}))

  bot.context.editMessageText = (text, extra) => {
    t.deepEqual(extra.reply_markup.inline_keyboard, [[
      {
        text: 'b',
        hide: false,
        callback_data: 'a:b:c:b'
      }
    ]])
    return Promise.resolve()
  }

  await bot.handleUpdate({callback_query: {data: 'a:b'}})
})

test('hidden key can not be set', async t => {
  t.plan(2)
  const menu = new TelegrafInlineMenu('foo')
  menu.select('c', ['a', 'b'], {
    setFunc: t.fail,
    hide: (ctx, key) => key === 'a'
  })

  const bot = new Telegraf()
  bot.use(menu.init({actionCode: 'a:b'}))

  bot.context.editMessageText = () => Promise.resolve(t.pass())
  bot.use(() => t.pass())

  await bot.handleUpdate({callback_query: {data: 'a:b:c:a'}})
})