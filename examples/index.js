const preact = require('preact')
const { interval, from } = require('rxjs')
const redux = require('redux')
const msleep = require('async-msleep')
const { Subscribe, subscribable, devtool } = require('../src')

//
// city-state
//

@subscribable
class Counter {
  constructor () {
    this._state = { count: 0 }
  }

  increment () {
    this._state.count += 1
  }

  decrement () {
    this._state.count -= 1
  }
}
const counter = new Counter()
devtool(counter, { name: 'Counter' })

function CounterView () {
  return (
    <Subscribe to={[counter]}>
      {(counterState) => {
        return (
          <div>
            <h1>Counter</h1>
            <p>state: {counterState.count}</p>
            <button onClick={() => counter.increment()}>Increment +</button><br />
            <button onClick={() => counter.decrement()}>Decrement -</button><br />
          </div>
        )
      }}
    </Subscribe>
  )
}

//
// city-state async
//

@subscribable
class CounterAsync {
  constructor () {
    this._state = {
      count: 0,
      isComputing: false
    }
  }

  async increment () {
    this._state.isComputing = true
    await msleep(1000)
    this._state.count += 1
    this._state.isComputing = false
  }

  async decrement () {
    this._state.isComputing = true
    await msleep(1000)
    this._state.count -= 1
    this._state.isComputing = false
  }
}
const counterAsync = new CounterAsync()
devtool(counterAsync, { name: 'CounterAsync' })

function CounterAsyncView () {
  return (
    <Subscribe to={[counterAsync]}>
      {(counterState) => {
        return (
          <div>
            <h1>Counter Async</h1>
            <p>state: {counterState.isComputing ? '...' : counterState.count}</p>
            <button disabled={counterState.isComputing} onClick={() => counterAsync.increment()}>Increment +</button><br />
            <button disabled={counterState.isComputing} onClick={() => counterAsync.decrement()}>Decrement -</button><br />
          </div>
        )
      }}
    </Subscribe>
  )
}

//
// redux
//

function counterReducer (state = { count: 0 }, action) {
  switch (action.type) {
    case 'INCREMENT':
      return {
        count: state.count + 1
      }
    case 'DECREMENT':
      return {
        count: state.count - 1
      }
    default:
      return state
  }
}

const counterStore = redux.createStore(counterReducer)

function CounterReduxView () {
  return (
    <Subscribe to={[counterStore]}>
      {(counterState = {}) => {
        return (
          <div>
            <h1>Counter with redux</h1>
            <p>state: {counterState.count}</p>
            <button onClick={() => counterStore.dispatch({ type: 'INCREMENT' })}>Increment +</button><br />
            <button onClick={() => counterStore.dispatch({ type: 'DECREMENT' })}>Decrement -</button><br />
          </div>
        )
      }}
    </Subscribe>
  )
}

//
// Native Observable
//

const counter2 = new Counter()
const observableCounter = from(counter2)
function ObservableCounterView () {
  return (
    <Subscribe to={[observableCounter]}>
      {(counterState = {}) => {
        return (
          <div>
            <h1>Counter Observable</h1>
            <p>state: {counterState.count}</p>
            <button onClick={() => counter2.increment()}>Increment +</button><br />
            <button onClick={() => counter2.decrement()}>Decrement -</button><br />
          </div>
        )
      }}
    </Subscribe>
  )
}

//
// rxjs
//

class TimerView extends preact.Component {
  constructor () {
    super()
    this.interval1 = interval(2000)
    this.interval2 = interval(1000)
    devtool(this.interval1, { name: 'interval1' })
    devtool(this.interval2, { name: 'interval2' })
  }

  render () {
    return (
      <Subscribe to={[this.interval1, this.interval2]}>
        {(time1, time2) => {
          return (
            <div>
              <h1>rxjs</h1>
              <p>time1: {time1}</p>
              <p>time2: {time2}</p>
            </div>
          )
        }}
      </Subscribe>
    )
  }
}

function Main () {
  return (
    <div>
      <CounterView />
      <CounterAsyncView />
      <CounterReduxView />
      <ObservableCounterView />
      <TimerView />
    </div>
  )
}

const $container = document.createElement('div')
document.body.appendChild($container)
preact.render(<Main />, $container)
