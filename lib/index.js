/* @flow */
import etch from 'etch'
import Package from './package'

// [x] Refactor this into a ./package file
// [ ]

// Ensure etch is using atom's scheduler
etch.setScheduler(atom.views)

module.exports = new Package()
