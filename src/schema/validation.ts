/**
 * Runtime JSON validation for A2UI messages
 */

import type { A2UIMessage } from './a2ui-envelope';
import type { A2UIComponent } from './component-types';
import { A2UI_COMPONENT_TYPES } from './component-types';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

function err(msg: string): ValidationResult {
  return { valid: false, errors: [msg] };
}

const OK: ValidationResult = { valid: true, errors: [] };

/** Validate an A2UI envelope message */
export function validateMessage(msg: unknown): ValidationResult {
  // Enhanced input validation
  if (msg === null || msg === undefined) {
    return err('Message must be a non-null object');
  }
  
  if (typeof msg !== 'object') {
    return err(`Message must be an object, received ${typeof msg}`);
  }

  // Check for circular references
  try {
    JSON.stringify(msg);
  } catch (e) {
    return err('Message contains circular references or non-serializable data');
  }

  const obj = msg as Record<string, unknown>;
  const keys = Object.keys(obj);

  if (keys.length === 0) {
    return err('Message must have at least one key');
  }

  if (keys.length > 1) {
    return err(`Message must have exactly one key, found: ${keys.join(', ')}`);
  }

  const type = keys[0];
  
  // Enhanced type validation
  if (typeof type !== 'string' || type.trim() === '') {
    return err('Message type must be a non-empty string');
  }

  const payload = obj[type];

  if (payload === null || typeof payload !== 'object') {
    return err(`Message payload for "${type}" must be an object, received ${typeof payload}`);
  }

  const p = payload as Record<string, unknown>;

  switch (type) {
    case 'createSurface':
      if (typeof p.surfaceId !== 'string' || p.surfaceId.trim() === '') {
        return err('createSurface.surfaceId must be a non-empty string');
      }
      return OK;

    case 'destroySurface':
      if (typeof p.surfaceId !== 'string' || p.surfaceId.trim() === '') {
        return err('destroySurface.surfaceId must be a non-empty string');
      }
      return OK;

    case 'updateDataModel':
      if (typeof p.surfaceId !== 'string' || p.surfaceId.trim() === '') {
        return err('updateDataModel.surfaceId must be a non-empty string');
      }
      if (typeof p.path !== 'string') {
        return err('updateDataModel.path must be a string');
      }
      if (!p.path.startsWith('/') && p.path !== '') {
        return err('updateDataModel.path must be a JSON Pointer (start with /)');
      }
      // Enhanced path validation
      if (p.path.includes('//')) {
        return err('updateDataModel.path cannot contain consecutive slashes');
      }
      return OK;

    case 'updateComponents':
      if (typeof p.surfaceId !== 'string' || p.surfaceId.trim() === '') {
        return err('updateComponents.surfaceId must be a non-empty string');
      }
      if (!Array.isArray(p.components)) {
        return err('updateComponents.components must be an array');
      }
      if (p.components.length === 0) {
        return err('updateComponents.components cannot be empty');
      }
      return validateComponents(p.components as unknown[]);

    case 'removeComponents':
      if (typeof p.surfaceId !== 'string' || p.surfaceId.trim() === '') {
        return err('removeComponents.surfaceId must be a non-empty string');
      }
      if (!Array.isArray(p.componentIds)) {
        return err('removeComponents.componentIds must be an array');
      }
      if (p.componentIds.length === 0) {
        return err('removeComponents.componentIds cannot be empty');
      }
      // Validate component IDs
      for (let i = 0; i < p.componentIds.length; i++) {
        const id = p.componentIds[i];
        if (typeof id !== 'string' || id.trim() === '') {
          return err(`removeComponents.componentIds[${i}] must be a non-empty string`);
        }
      }
      return OK;

    case 'appendData':
      if (typeof p.surfaceId !== 'string' || p.surfaceId.trim() === '') {
        return err('appendData.surfaceId must be a non-empty string');
      }
      if (typeof p.path !== 'string') {
        return err('appendData.path must be a string');
      }
      if (!Array.isArray(p.items)) {
        return err('appendData.items must be an array');
      }
      if (p.items.length === 0) {
        return err('appendData.items cannot be empty');
      }
      return OK;

    case 'patchDataModel':
      if (typeof p.surfaceId !== 'string' || p.surfaceId.trim() === '') {
        return err('patchDataModel.surfaceId must be a non-empty string');
      }
      if (typeof p.patch !== 'object' || p.patch === null) {
        return err('patchDataModel.patch must be an object');
      }
      if (Array.isArray(p.patch)) {
        return err('patchDataModel.patch must be an object, not an array');
      }
      // Check for empty patch
      if (Object.keys(p.patch).length === 0) {
        return err('patchDataModel.patch cannot be empty');
      }
      return OK;

    default:
      return err(`Unknown message type: ${type}. Valid types are: createSurface, destroySurface, updateDataModel, updateComponents, removeComponents, appendData, patchDataModel`);
  }
}

/** Validate a components array */
function validateComponents(components: unknown[]): ValidationResult {
  const errors: string[] = [];

  if (components.length === 0) {
    return err('Components array cannot be empty');
  }

  // Check for duplicate IDs
  const ids = new Set<string>();
  const duplicateIds = new Set<string>();

  for (let i = 0; i < components.length; i++) {
    const c = components[i];
    if (c === null || typeof c !== 'object') {
      errors.push(`components[${i}]: must be an object`);
      continue;
    }
    const comp = c as Record<string, unknown>;
    
    // Enhanced ID validation
    if (typeof comp.id !== 'string') {
      errors.push(`components[${i}]: id must be a string`);
    } else if (comp.id.trim() === '') {
      errors.push(`components[${i}]: id cannot be empty`);
    } else {
      // Check for duplicates
      if (ids.has(comp.id)) {
        duplicateIds.add(comp.id);
      } else {
        ids.add(comp.id);
      }
    }
    
    // Enhanced component type validation
    if (typeof comp.component !== 'string') {
      errors.push(`components[${i}]: component must be a string`);
    } else if (comp.component.trim() === '') {
      errors.push(`components[${i}]: component type cannot be empty`);
    } else if (!(A2UI_COMPONENT_TYPES as readonly string[]).includes(comp.component)) {
      errors.push(`components[${i}]: unknown component type "${comp.component}". Valid types are: ${A2UI_COMPONENT_TYPES.join(', ')}`);
    }
  }

  // Report duplicate IDs
  duplicateIds.forEach(id => {
    errors.push(`Duplicate component ID found: "${id}"`);
  });

  return errors.length > 0 ? { valid: false, errors } : OK;
}

/** Validate a single component */
export function validateComponent(comp: unknown): ValidationResult {
  if (comp === null || comp === undefined) {
    return err('Component must be a non-null object');
  }
  if (typeof comp !== 'object') {
    return err(`Component must be an object, received ${typeof comp}`);
  }
  return validateComponents([comp]);
}

/** Type guard for A2UIMessage */
export function isA2UIMessage(msg: unknown): msg is A2UIMessage {
  try {
    return validateMessage(msg).valid;
  } catch (error) {
    // If validation throws an error, consider it invalid
    return false;
  }
}

/** Type guard for A2UIComponent */
export function isA2UIComponent(comp: unknown): comp is A2UIComponent {
  try {
    return validateComponent(comp).valid;
  } catch (error) {
    // If validation throws an error, consider it invalid
    return false;
  }
}

/** Validate and sanitize a message, returning the validated message or null */
export function sanitizeMessage(msg: unknown): A2UIMessage | null {
  const validation = validateMessage(msg);
  if (!validation.valid) {
    console.error('Message validation failed:', validation.errors);
    return null;
  }
  return msg as A2UIMessage;
}

/** Validate and sanitize a component, returning the validated component or null */
export function sanitizeComponent(comp: unknown): A2UIComponent | null {
  const validation = validateComponent(comp);
  if (!validation.valid) {
    console.error('Component validation failed:', validation.errors);
    return null;
  }
  return comp as A2UIComponent;
}
