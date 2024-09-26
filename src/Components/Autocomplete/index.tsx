import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {useFloating, useFocus, useInteractions} from '@floating-ui/react';
import { debounce } from "../../utils";
import Spinner from "../Spinner";

type Option = string | Record<string, string>

type AutocompleteProps<T extends Option> = {
  description?: string;
  disabled?: false;
  filterOptions?: (options: T[], inputValue: string | undefined) => T[]
  label?: string;
  loading?: boolean;
  multiple?: boolean;
  onChange?: (value: T | T[]) => void;
  onInputChange?: (value: string) => void;
  options: T[];
  placeholder?: string;
  renderOption?: (value: T) => ReactNode;
  value?: T | T[];
  async?: boolean;
  asyncWait?: number
}



const Autocomplete= <T extends Option>({description, disabled, filterOptions, label, loading = false, multiple, onChange, onInputChange, options, placeholder, renderOption, value, async, asyncWait}: AutocompleteProps<T>) => {
  
  const [searchInput, setSearchInput] = useState<string | undefined>(async ? undefined : "")
  const [open, setOpen] = useState<boolean>(false)
  const [highlightedIndex, setHighlightedIndex] = useState<undefined | number>(undefined)
  const [filteredOptions, setFilteredOptions] = useState<T[]>([])
  const [selectedValue, setSelectedValue] = useState<T | T[] | undefined>(value)
  const [visible, setVisible] = useState<boolean>(loading)
  const inputRef = useRef<HTMLInputElement | null>(null)
  

  const {refs, floatingStyles, context} = useFloating({
    open: open,
    onOpenChange: (open) => {
      if (!async) {
        setOpen(open);  // Only update if async is false
      } else {
        if (!open) setOpen(false)
      }
    },
  })

  const focus = useFocus(context)

  const {getReferenceProps, getFloatingProps} = useInteractions([
    focus,
  ]);

  const getFilteredOptions = useCallback(() => {
    return !filterOptions ? options.filter(option => {
      if (!searchInput) return true
      if (typeof option === "string") {
        return option.indexOf(searchInput) !== -1
      } else {
        return option["label"] && option["label"].indexOf(searchInput) !== -1
      }
    }) : filterOptions(options, searchInput)
  }, [filterOptions, options, searchInput])

  useEffect(() => {
    if (selectedValue && onChange) {
      onChange(selectedValue)
    }
  }, [selectedValue, onChange])



  const addhighlighted = useCallback(() => {
    if (highlightedIndex === undefined) return
    const highlightedOption = filteredOptions[highlightedIndex]
    if (multiple) {
        setSelectedValue(prev => {
          const currValues = prev === undefined ? [] : prev as T[]
          if ( currValues.includes(highlightedOption)) {
            return currValues.filter(option => option !== highlightedOption)
          } else {
            return [... currValues, highlightedOption]
          }
        })
    } else {
      setSelectedValue(filteredOptions[highlightedIndex!])
      closeSearch()
    }
  }, [filteredOptions, multiple, highlightedIndex])
    

  const updateSearchInput = (eve: React.ChangeEvent<HTMLInputElement>) => {
    const updatedValue = eve.target.value
    const prefix = getSearchInputPrefix()
    const search = updatedValue.slice(prefix.length)
    if (onInputChange) {
      onInputChange(search)
    }
    setSearchInput(search)
  }

  const debouncedSearch = useMemo(() => {
    return debounce((options) => {
      if (!open) setOpen(true)
      setFilteredOptions(options)
      setVisible(false)
    }, asyncWait ?? 2000)
  }, [])

  const closeSearch = () => {
    setOpen(false)
    inputRef.current?.blur()
  }

  useEffect(() => {
    if (async && searchInput !== undefined) {
      setVisible(true)
      debouncedSearch(getFilteredOptions())
    } else {
      setFilteredOptions(getFilteredOptions())
    }
  }, [searchInput, async])

  useEffect(() => {
    const handleKeyDown = (event:  KeyboardEvent) => {
      if (event.key === "ArrowDown") {
        event.preventDefault()
        setHighlightedIndex(prev => prev === undefined ? 0 : (prev + 1) % filteredOptions.length)
      } else if (event.key === "ArrowUp") {
        event.preventDefault()
        setHighlightedIndex(prev => prev === undefined ? 0 : (prev - 1 + filteredOptions.length) % filteredOptions.length)
      } else if (event.key === "Enter") {
        event.preventDefault()
        addhighlighted()
      } else if (event.key === "Escape") {
        event.preventDefault()
        closeSearch()
      }
    }
    const inputElement = inputRef.current
    inputElement?.addEventListener('keydown', handleKeyDown)
    return () => {
      inputElement?.removeEventListener('keydown', handleKeyDown);
    };
  }, [addhighlighted, filteredOptions.length, inputRef])

  const getSearchInputPrefix = () => {
    let prefix = ""
    if (selectedValue) {
      if (Array.isArray(selectedValue)) {
        prefix = selectedValue.map(value => {
          return typeof value === "string" ? value : value["label"]
        }).join(" | ")
      } else {
        prefix = typeof selectedValue === "string" ? selectedValue : selectedValue["label"] 
      }
    }
    return prefix ? prefix + " | " : prefix
  }

  return (
    <div className={`w-full relative flex flex-col gap-1`}>
      {label && <label className="text-gray-500 text-md">{label}</label>}
      <div className="flex items-center gap-2 border pl-2 focus-within:border-blue-500 border-2" ref={refs.setReference} {...getReferenceProps()}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
        <input type="text" placeholder={placeholder} onChange={updateSearchInput} value={getSearchInputPrefix() + (searchInput ?? "")} disabled={disabled} className="flex-1 rounded focus:outline-none h-12" ref={inputRef}>
        </input>
        {async && <Spinner className="absolute right-2" width="20" strokeWidth="5" visible={visible}></Spinner>}
      </div>
      {description && <div className="text-gray-500 text-md">{description}</div>}
      {open && <ul ref={refs.setFloating} className={`border w-full max-h-80 overflow-y-auto z-10`} style={floatingStyles} {...getFloatingProps}>
        {filteredOptions.length > 0 ? filteredOptions.map((option, idx) => {
          return (
            <li key={idx} className={`${highlightedIndex === idx ? "bg-blue-200" : (idx % 2 === 0 ? "bg-slate-50" : "bg-white")} h-auto p-3 cursor-pointer flex justify-between`} onMouseEnter={() => setHighlightedIndex(idx)} onMouseDown={(e) => {
              e.preventDefault()
              addhighlighted()
            }}>
              {!renderOption ? <div>
                {typeof option === "string" 
                ? option
                : Object.entries(option).map(([key, value]) => (
                  <p key={key}>{key === "label" ? `${value}` : `${key}: ${value}`}</p>
                ))}
              </div>: <>{renderOption(option)}</>}
              {multiple && <input type="checkbox" value={typeof option === "string" ? option : option["label"]} className="cursor-pointer w-5" onChange={() => {}} checked={(selectedValue as T[])?.includes(option) ?? false}></input>}
            </li>
          ) 
        }): <li className="h-10 p-2 bg-white">No results were found</li>}
      </ul>}
    </div>
  )
}

export default Autocomplete