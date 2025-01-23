# Validation Criteria


## Example A
Schema: [String]
Content: ["1", "2", 3, "4", 5]
Validate Primitives: ["1", "2", "4"]

## Example B
Schema: [
  { aaa: Number, bbb: Number }
]
Content: [
  { aaa: 111, bbb: 222 },
  { aaa: 222, bbb: 333 },
  { aaa: "333", bbb: "444" },
  { aaa: 444, bbb: 555 },
  { aaa: "555", bbb: "666" }
]
Validate Objects: [
  { aaa: 111 },
  { aaa: 222},
  { aaa: 444 }
]
Validate Primitives: [
  { aaa: 111 },
  { aaa: 222},
  {},
  { aaa: 444 },
  {}
]

## Example C
Schema: [
  { aaa: {
    bbb: Number,
    ccc: String,
    ddd: Boolean,
    eee: {
      fff: Boolean,
      ggg: String,
      hhh: Number,
    },
  } }
]
Content [{
  aaa: {
    bbb: "222",
    ccc: "CCC",
    ddd: true,
    eee: {
      fff: "true",
      ggg: "777",
      hhh: "888",
    }
  }
}, ]

Validate Objects []
Validate Primitives: [{
  aaa: {
    ccc: "CCC",
    ddd: true,
    eee: {
      ggg: "777",
    },
  }
}]

## Example D
Schema: [
  { aaa: {
    bbb: Number,
    ccc: String,
    ddd: Boolean,
    eee: {
      fff: Boolean,
      ggg: String,
      hhh: Number,
    },
  } }
]
Content [{
  aaa: {
    bbb: "222",
    ccc: 333,
    ddd: "false",
    eee: {
      fff: "true",
      ggg: "777",
      hhh: "888",
    }
  }
}]

Validate Objects []
Validate Primitives: [{
  aaa: {
    eee: {
      ggg: "777",
    },
  }
}]

## Example E
```
import { Model } from '/dependencies/mvc-framework.js'
const modelOptionsA = { validationType: 'primitive' }
const modelOptionsB = { validationType: 'object' }
const { content, schema } = new Model({
  schema: [{
    aaa: { type: {
      bbb: { type: String },
      ccc: { type: Number },
      ddd: { type: Boolean },
      eee: { type: {
        fff: { type: String },
        ggg: { type: Number },
        hhh: { type: Boolean },
      } },
    } }
  }],
  content: [{
    aaa: {
      bbb: "BBB",
      ccc: 333,
      ddd: false,
      eee: {
        fff: "FFF",
        ggg: 777,
        hhh: true
      }
    },
  }, {
    aaa: {
      bbb: 222,
      ccc: "CCC",
      ddd: true,
    }
  }]
}, modelOptionsA/*modelOptionsB*/)

// Model Options A | Validate Primitives
[{
  aaa: {
    bbb: "BBB",
    ccc: 333,
    ddd: false,
  },
}, {
  aaa: {
    ddd: false
  }
}]

// Model Options B | Validate Objects
[{
  aaa: {
    bbb: "BBB",
    ccc: 333,
    ddd: false,
  },
}]
```