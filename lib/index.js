/* @flow */
import etch from 'etch'
import Package from './package'

// Ensure etch is using atom's scheduler
etch.setScheduler(atom.views)

module.exports = new Package()
