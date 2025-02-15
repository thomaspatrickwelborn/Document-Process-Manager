import { recursiveAssign, recursiveAssignConcat } from '../Coutil/index.js'
import Core from '../Core/index.js'
import Databases from '../Databases/index.js'
import Documents from '../Documents/index.js'
import Router from '../Router/index.js'
import Sockets from '../Sockets/index.js'
import Settings from './Settings/index.js'
import Options from './Options/index.js'
export default class Control extends Core {
  static propertyClasses = {
    databases: {
      ID: "DATABASE",
      Name: "databases",
      Class: Database,
      Names: {
        Monople: { Formal: "Database", Nonformal: "database" },
        Multiple: { Formal: "Databases", Nonformal: "databases" },
        Minister: {
          Ad: { Formal: "Add", Nonformal: "add" },
          Dead: { Formal: "Remove", Nonformal: "remove" },
        },
      },
      Events: { Assign: "on", /* Deassign: "removeEventListener" */ },
    },
    documents: {
      ID: "DOCUMENT",
      Name: "documents",
      Class: Document,
      Names: {
        Monople: { Formal: "Document", Nonformal: "document" },
        Multiple: { Formal: "Documents", Nonformal: "documents" },
        Minister: {
          Ad: { Formal: "Add", Nonformal: "add" },
          Dead: { Formal: "Remove", Nonformal: "remove" },
        },
      },
      Events: { Assign: "addEventListener", Deassign: "removeEventListener" },
    },
    router: {
      ID: "ROUTER",
      Name: "router",
      Class: Router,
      Names: {
        Monople: { Formal: "Router", Nonformal: "control" },
        Multiple: { Formal: "Routers", Nonformal: "router" },
        Minister: {
          Ad: { Formal: "Add", Nonformal: "add" },
          Dead: { Formal: "Remove", Nonformal: "remove" },
        },
      },
      Events: { Assign: "addEventListener", Deassign: "removeEventListener" },
    },
    // locationRouters: {
    //   ID: "LOCATIONROUTER",
    //   Name: "locationRouters",
    //   Class: LocationRouter,
    //   Names: {
    //     Monople: { Formal: "LocationRouter", Nonformal: "locationRouter" },
    //     Multiple: { Formal: "LocationRouters", Nonformal: "locationRouters" },
    //     Minister: {
    //       Ad: { Formal: "Add", Nonformal: "add" },
    //       Dead: { Formal: "Remove", Nonformal: "remove" },
    //     },
    //   },
    //   Events: { Assign: "addEventListener", Deassign: "removeEventListener" },
    // },
    // fetchRouters: {
    //   ID: "FETCHROUTER",
    //   Name: "fetchRouters",
    //   Class: FetchRouter,
    //   Names: {
    //     Monople: { Formal: "FetchRouter", Nonformal: "fetchRouter" },
    //     Multiple: { Formal: "FetchRouters", Nonformal: "fetchRouters" },
    //     Minister: {
    //       Ad: { Formal: "Add", Nonformal: "add" },
    //       Dead: { Formal: "Remove", Nonformal: "remove" },
    //     },
    //   },
    //   Events: { Assign: "addEventListener", Deassign: "removeEventListener" },
    // },
    // socketRouters: {
    //   ID: "SOCKETROUTER",
    //   Name: "socketRouters",
    //   Class: SocketRouter,
    //   Names: {
    //     Monople: { Formal: "SocketRouter", Nonformal: "socketRouter" },
    //     Multiple: { Formal: "SocketRouters", Nonformal: "socketRouters" },
    //     Minister: {
    //       Ad: { Formal: "Add", Nonformal: "add" },
    //       Dead: { Formal: "Remove", Nonformal: "remove" },
    //     },
    //   },
    //   Events: { Assign: "addEventListener", Deassign: "removeEventListener" },
    // },
  }
  constructor($settings = {}, $options = {}) {
    super(
      recursiveAssign({
        propertyClasses: Control.propertyClasses,
      }, Settings, $settings),
      recursiveAssign({}, Options, $options),
    )
    const { enableEvents } = this.options
    if(enableEvents) this.enableEvents()
  }
}