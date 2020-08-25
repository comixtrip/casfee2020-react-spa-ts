import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { withRouter } from 'react-router';

const Header: React.FC = () => {
  return (
    <div className="flex pa1 justify-between nowrap orange">
      <div className="flex flex-fixed black">
        <div className="fw7 mr1">Hacker News</div>
        <Link to="/" className="ml1 no-underline black">
          Slack
        </Link>
        <div className="ml1">|</div>
        <Link to="/not-found" className="ml1 no-underline black">
          submit
        </Link>
      </div>
    </div>
  );
};

export default Header;
