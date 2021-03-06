let Declaration = require('../declaration')
let {
  parseTemplate,
  insertAreas,
  getGridGap,
  warnGridGap,
  warnDuplicateNames,
  inheritGridGap
} = require('./grid-utils')

class GridTemplate extends Declaration {
  static names = ['grid-template']

  /**
   * Translate grid-template to separate -ms- prefixed properties
   */
  insert (decl, prefix, prefixes, result) {
    if (prefix !== '-ms-') return super.insert(decl, prefix, prefixes)

    if (decl.parent.some(i => i.prop === '-ms-grid-rows')) {
      return undefined
    }

    let gap = getGridGap(decl)

    /**
     * we must insert inherited gap values in some cases:
     * if we are inside media query && if we have no grid-gap value
    */
    let inheritedGap = inheritGridGap(decl, gap)

    let {
      rows,
      columns,
      areas
    } = parseTemplate({
      decl,
      gap: inheritedGap || gap
    })

    let hasAreas = Object.keys(areas).length > 0
    let hasRows = Boolean(rows)
    let hasColumns = Boolean(columns)

    warnGridGap({
      gap,
      hasColumns,
      decl,
      result
    })

    // warn if grid-template has a duplicate area name
    warnDuplicateNames({ decl, result })

    if ((hasRows && hasColumns) || hasAreas) {
      decl.cloneBefore({
        prop: '-ms-grid-rows',
        value: rows,
        raws: { }
      })
    }

    if (hasColumns) {
      decl.cloneBefore({
        prop: '-ms-grid-columns',
        value: columns,
        raws: { }
      })
    }

    if (hasAreas) {
      insertAreas(areas, decl, result)
    }

    return decl
  }
}

module.exports = GridTemplate
