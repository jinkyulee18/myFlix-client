import PropTypes from 'prop-types';

//function of movie card
export const MovieCard = ({ movie, onMovieClick }) => {
  return (
    <div
      onClick={() => {
        onMovieClick(movie);
      }}
    >
      {movie.title}
    </div>
  );
};

//proptype constraints 
MovieCard.propTypes = {
  movie: PropTypes.shape({
    title: PropTypes.string.isRequired,
    Director: PropTypes.string.isRequired,
    Desctiption: PropTypes.string.isRequired,
    Genre: PropTypes.string.isRequired,
  }) .isRequired,
  onMovieClick: PropTypes.func.isRequired
};