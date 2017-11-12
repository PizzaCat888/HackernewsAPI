import React, { Component } from 'react';
import './App.css';
import { sortBy } from 'lodash';
import './index.css';
import classNames from 'classnames';

const DEFAULT_QUERY = 'redux';
const DEFAULT_PAGE = 0;
const DEFAULT_HPP = '100'; //fetches more data

const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';
const PARAM_HPP = 'hitsPerPage=';

//Lodash libary - for sorting lists
const SORTS = {
  NONE: list => list,
  TITLE: list => sortBy(list, 'title'),
  AUTHOR: list => sortBy(list, 'author'),
  COMMENTS: list => sortBy(list, 'num_comments').reverse(),
  POINTS: list => sortBy(list, 'points').reverse(),
  };


  function isSearched(query) {
    return function(item) {
    return !query || item.title.toLowerCase().indexOf(query.toLowerCase()) !== -1;
    }
    }

    // const isSearched = (query) => (item) => !query || item.title.toLowerCase().index\
    // Of(query.toLowerCase()) !== -1; //ES6 way of isSearched function

class App extends Component {

constructor(props) {
  super(props);

  this.state = {
    results: null,
    query: DEFAULT_QUERY,
    searchKey: '',
    isLoading: false,
    sortKey: 'NONE',
    isSortReverse: false,
  };

  this.needsToSearchTopstories = this.needsToSearchTopstories.bind(this);
  this.setSearchTopstories = this.setSearchTopstories.bind(this);
  this.fetchSearchTopstories = this.fetchSearchTopstories.bind(this);
  this.onSearchChange = this.onSearchChange.bind(this);
  this.onSearchSubmit = this.onSearchSubmit.bind(this);
  this.onSort = this.onSort.bind(this);
}

  onSort(sortKey) {
    const isSortReverse = this.state.sortKey === sortKey && !this.state.isSortReverse;
    this.setState({ sortKey, isSortReverse });
  }

  needsToSearchTopstories(query) {
  return !this.state.results[query]; //helps to stop a search if previous query was the same
  }

  onSearchSubmit(event) {
  const { query } = this.state;
  this.setState({ searchKey: query });
  if (this.needsToSearchTopstories(query)) {
  this.fetchSearchTopstories(query, DEFAULT_PAGE); //helps to stop a search if previous query was the same
  }
  event.preventDefault(); //stops page from refreshing on submit
  }

  setSearchTopstories(result) {
    const { hits, page } = result;
    const { searchKey } = this.state;
    const { query } = this.state;
    const oldHits = page === 0 ? [] : this.state.results[searchKey].hits;
    const updatedHits = [ ...oldHits, ...hits ]; //ES6 spread
    this.setState({ 
      results: { ...this.state.results, [searchKey]: { hits: updatedHits, page }}, //ES6 dynamic key
      isLoading: false
    });
  }

  fetchSearchTopstories(query, page) {
    this.setState({ isLoading: true }); //showing loading screen
    fetch(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${query}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`)
  .then(response => response.json())
  .then(result => this.setSearchTopstories(result));
  }

  componentDidMount() {
  const { query } = this.state;
  this.setState({ searchKey: query });
  this.fetchSearchTopstories(query, DEFAULT_PAGE);
  }

  onSearchChange(event) {
    this.setState({ query: event.target.value });
  }



  render() {
    const { query, results, searchKey, isLoading, sortKey, isSortReverse } = this.state;
    const page = (results && results[searchKey] && results[searchKey].page) || 0;
    const list = (results && results[searchKey] && results[searchKey].hits) || [];
    return (
    <div className="page">
      <div className="interactions">
    <Search value={query} onChange={this.onSearchChange} onSubmit={this.onSearchSubmit}>
    Search
    </Search>
    </div>
    <Table list={list} sortKey={sortKey} onSort={this.onSort} isSortReverse={isSortReverse}/>
    <div className="interactions">
    { isLoading ?
<Loading /> :
   <ButtonWithLoading //Higher order component, conditional rendering based on the loading property
   isLoading={isLoading} onClick={() => this.fetchSearchTopstories(searchKey, page + 1)}>
    More
  </ButtonWithLoading>
    }
</div>
    </div>
    );
    }
    }

      //functional stateless component
      const Search = ({ value, onChange, onSubmit, children }) =>
      <form onSubmit={onSubmit}>
      <input type="text" value={value} onChange={onChange} />
      <button type="submit">{children}</button>
        </form>
        

        

        //ES6 class component
      // class Table extends Component {
      //   render() {
      //   const { list, pattern } = this.props;
      //   return (
      //   <div>
      //   { list.filter(isSearched(pattern)).map((item) =>
      //   <div key={item.objectID}>
      //   <span><a href={item.url}>{item.title}</a></span>
      //   <span>{item.author}</span>
      //   <span>{item.num_comments}</span>
      //   <span>{item.points}</span>
      //   </div>
      //   )}
      //   </div>


const Table = ({ list, sortKey, isSortReverse, onSort }) => {
  const sortedList = SORTS[sortKey](list);
  const reverseSortedList = isSortReverse ? sortedList.reverse() : sortedList;
  return(
<div className="table">
  <div className="table-header">
    <span style={{ width: '40%' }}>
    <Sort sortKey={'TITLE'} onSort={onSort} activeSortKey={sortKey}>
    Title
    </Sort>
    </span>
    <span style={{ width: '30%' }}>
    <Sort sortKey={'AUTHOR'} onSort={onSort} activeSortKey={sortKey}>
    Author
    </Sort>
    </span>
    <span style={{ width: '15%' }}>
    <Sort sortKey={'COMMENTS'} onSort={onSort}  activeSortKey={sortKey}>
    Comments
    </Sort>
    </span>
    <span style={{ width: '15%' }}>
    <Sort sortKey={'POINTS'} onSort={onSort}  activeSortKey={sortKey}>
    Points
    </Sort>
  </span>
</div>
{ reverseSortedList.map((item) =>
<div key={item.objectID} className="table-row">
<span style={{ width: '40%' }}>
<a href={item.url}>{item.title}</a>
</span>
<span style={{ width: '30%' }}>
{item.author}
</span>
<span style={{ width: '15%' }}>
{item.num_comments}
</span>
<span style={{ width: '15%' }}>
{item.points}
</span>
</div>
)}
</div>
  )}

const Button = ({ onClick, className, children }) =>
<button onClick={onClick} className={className} type="button">
{children}
</button>

//loading screen component
const Loading = () =>
<div>Loading ...</div>

const withLoading = (Component) => ({ isLoading, ...props }) =>
isLoading ? <Loading /> : <Component { ...props } />;

const ButtonWithLoading = withLoading(Button);

const Sort = ({ sortKey, activeSortKey, onSort, children }) => {
  const sortClass = classNames('button-inline', { 'button-active': sortKey === activeSortKey }); //show button-active class if sortkey is equal to activesortkey using classnames libary
  return (
  <button onClick={() => onSort(sortKey)} className={sortClass} type="button">
  {children}
  </button>
  );
  }
    
  


export default App

export {
  Button,
  Search,
  Table,
  };