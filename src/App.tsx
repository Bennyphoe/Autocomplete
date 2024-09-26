import './App.css'
import Autocomplete from './Components/Autocomplete'

const testDataString = ["apple", "bee", "pie", "pear"]
const testDataObject = [
  {
    label: "Apple",
    color: "red",
    size: "small"
  },
  {
    label: "Bee",
    color: "blue",
    size: "small"
  },
  {
    label: "Pie",
    color: "brown",
    size: "small"
  },
  {
    label: "Pear",
    color: "green",
    size: "large"
  },
  {
    label: "Banana",
    color: "Yellow",
    size: "medium"
  }
]

function App() {

  return (
    <div className="min-h-screen flex justify-center items-center bg-slate-50">
      <div className='w-96 flex flex-col p-4 gap-4 border bg-white'>
        <Autocomplete options={testDataObject} label="Async Search" placeholder='Type to begin searching' description='This is an Async search with multiple select' multiple async={true}/>
        <Autocomplete options={testDataObject} label="Async Search" placeholder='Type to begin searching' description='This is an Async search with single select' async={true}/>
        <Autocomplete options={testDataString} label="Sync Search" placeholder='Type to begin searching' description='This is a sync search with multiple select' multiple async={false}/>
        <Autocomplete options={testDataString} label="Sync Search" placeholder='Type to begin searching' description='This is a sync search with single select' async={false} />
      </div>
    </div>
  )
}

export default App
